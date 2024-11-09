import { Component, OnInit } from '@angular/core';
import { EnvioService } from '../../../../shared/services/envio.service';
import { RecojoService } from '../../../../shared/services/recojo.service';
import { ClienteService } from '../../../../shared/services/cliente.service';
import { PedidoService } from '../../../../shared/services/pedido.service';
import { DetallePedidoService } from '../../../../shared/services/detalle-pedido.service';
import { ProductoService } from '../../../../shared/services/producto.service';
import { DetallePedidoBody } from '../../../../shared/models/detallePedido';
import { CarritoService } from '../../../../shared/services/carrito.service';
import { ComprobanteService } from '../../../../shared/services/comprobante.service';
import { jsPDF } from 'jspdf';

// Define la interfaz para los detalles del pedido
interface DetallePedido {
  cantidad: number;
  precioUnitario: number;
  precioDescuento: number;
  subtotal: number;
  idProducto: number;
  idPedido: number;
  nombreProducto: string; // Agrega el nombre del producto
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  carritoIds: string[] = [];
  cantidades: { [key: string]: number } = {};
  detallePedidos: DetallePedido[] = []; // Cambia aquí para usar la interfaz
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private envioService: EnvioService,
    private recojoService: RecojoService,
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private comprobanteService: ComprobanteService
  ) {}

  ngOnInit(): void {
    this.carritoIds = this.carritoService.getCarritoIds();
    this.cargarCantidadesDesdeStorage();
  }

  cargarCantidadesDesdeStorage(): void {
    const cantidadesGuardadas = localStorage.getItem('cantidades');
    if (cantidadesGuardadas) {
      this.cantidades = JSON.parse(cantidadesGuardadas);
    }
  }

  continue(): void {
    const selectedDepartamento = localStorage.getItem('selectedDepartamento');
    const selectedProvincia = localStorage.getItem('selectedProvincia');
    const selectedDistrito = localStorage.getItem('selectedDistrito');
    const referencia = localStorage.getItem('referencia');
    const CodigoPostal = localStorage.getItem('CodigoPostal');
    const total = parseFloat(localStorage.getItem('totalCarrito') || '0');

    const rucData = localStorage.getItem('rucData') ? JSON.parse(localStorage.getItem('rucData')!) : null;
    const dniData = localStorage.getItem('dniData') ? JSON.parse(localStorage.getItem('dniData')!) : null;

    const razonSocial = localStorage.getItem('switchState') === 'true' ? rucData?.razonSocial : `${dniData?.nombres} ${dniData?.apellidoPaterno} ${dniData?.apellidoMaterno}`;
    const email = localStorage.getItem('switchState') === 'true' ? localStorage.getItem('gmailFactura') : localStorage.getItem('gmailBoleta');
    const telefonoMovil = localStorage.getItem('switchState') === 'true' ? localStorage.getItem('celularFactura') : localStorage.getItem('celularBoleta');
    const tipoDocumento = localStorage.getItem('switchState') === 'true' ? 'RUC' : 'DNI';
    const numeroDocumento = localStorage.getItem('switchState') === 'true' ? rucData?.ruc : dniData?.dni;
    const direccionFiscal = localStorage.getItem('switchState') === 'true' ? rucData?.direccion : '';
    const formEnviadoConExito = true;

    let envioData = null;
    let recojoData = null;

    if (selectedDepartamento && selectedProvincia && selectedDistrito && referencia && CodigoPostal) {
      const [calle, numeroDomicilio] = referencia.split('N°').map(part => part.trim());
      const localidad = `${selectedDepartamento} ${selectedProvincia} ${selectedDistrito}`;

      envioData = {
        region: selectedDepartamento,
        provincia: selectedProvincia,
        distrito: selectedDistrito,
        localidad: localidad,
        calle: calle,
        nDomicilio: numeroDomicilio,
        codigoPostal: CodigoPostal,
        fechaEnvio: null,
        fechaEntrega: null,
        responsableEntrega: null,
        idPersonal: 1
      };
    } else {
      recojoData = {
        fechaListo: null,
        fechaEntrega: null,
        responsableDeRecojo: null,
      };
    }

    const clienteData = {
      razonSocial: razonSocial,
      email: email,
      telefonoMovil: telefonoMovil,
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      direccionFiscal: direccionFiscal
    };

    if (envioData) {
      this.envioService.create(envioData).subscribe((envio: any) => {
        const envioId = envio?.idEnvio || envio?.data?.idEnvio;
        if (envioId != null) {
          localStorage.setItem('envioId', envioId.toString());
          this.savePedido(envioId, null, clienteData, total);
        } else {
          console.error('Error: Envio no contiene un id.', envio);
        }
      });
    } else if (recojoData) {
      this.recojoService.create(recojoData).subscribe((recojo: any) => {
        const recojoId = recojo?.idRecojo;
        if (recojoId != null) {
          localStorage.setItem('recojoId', recojoId.toString());
          this.savePedido(null, recojoId, clienteData, total);
          this.successMessage = 'Pago realizado con éxito';
          this.errorMessage = ''; // Limpiar el mensaje de error si lo hubiera
        } else {
          console.error('Error: Recojo no contiene un id.', recojo);
          this.errorMessage = 'Algo salió mal. Inténtalo nuevamente.';
          this.successMessage = ''; // Limpiar el mensaje de éxito si lo hubiera
        }
      });
    }

  }

  savePedido(envioId: number | null, recojoId: number | null, clienteData: any, total: number): void {
    this.clienteService.create(clienteData).subscribe((cliente: any) => {
      const clienteId = cliente?.idCliente || cliente?.id;
      if (clienteId != null) {
        localStorage.setItem('clienteId', clienteId.toString());

        const pedidoData = {
          fechaPedido: new Date(),
          fechaCancelado: null,
          tipoPedido: envioId ? 'Envio a Domicilio' : 'Recojo en Tienda',
          estado: 'Pendiente',
          total: total,
          idCliente: clienteId,
          idPersonal: 1,
          idEnvio: envioId,
          idRecojo: recojoId
        };

        this.pedidoService.create(pedidoData).subscribe((pedido: any) => {
          const pedidoId = pedido?.idPedido || pedido?.id;
          if (pedidoId != null) {
            localStorage.setItem('pedidoId', pedidoId.toString());
            this.saveDetallePedido(pedidoId).then(() => {
              this.createComprobante(clienteData, pedidoId, total); // Pasa el total aquí
            });
          } else {
            console.error('Error: Pedido no contiene un id.', pedido);
          }
        });
      } else {
        console.error('Error: Cliente no contiene un id.', cliente);
      }
    });
  }

  saveDetallePedido(pedidoId: number): Promise<void> {
    if (this.carritoIds.length === 0) {
      console.error('No hay productos en el carrito.');
      return Promise.reject('No hay productos en el carrito.');
    }

    const detalles: DetallePedido[] = [];

    const observables = this.carritoIds.map(id => {
      const cantidad = this.cantidades[id];
      return this.productoService.getById(Number(id)).toPromise().then((producto: any) => {
        const precioUnitario = producto?.precio;
        const precioDescuento = producto?.precioOferta || 0;
        const subtotal = precioDescuento > 0 ? precioDescuento * cantidad : precioUnitario * cantidad;

        const detallePedidoData: DetallePedidoBody = {
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          precioDescuento: precioDescuento,
          subtotal: subtotal,
          idProducto: Number(id),
          idPedido: pedidoId
        };

        detalles.push({ 
          ...detallePedidoData, 
          nombreProducto: producto?.productoNombre, 
          precioDescuento: precioDescuento !== null ? precioDescuento : 0 
        });

        return this.detallePedidoService.create(detallePedidoData).toPromise();
      });
    });

    return Promise.all(observables).then(() => {
      this.detallePedidos = detalles; 
      console.log('Detalles de pedido guardados:', detalles);
    }).catch(err => {
      console.error('Error al guardar los detalles del pedido:', err);
      throw err; // Propagar el error
    });
  }

  createComprobante(clienteData: any, pedidoId: number, total: number): void {
    const tipoDocumento = localStorage.getItem('switchState') === 'true' ? 'RUC' : 'DNI';
    const tipoComprobante = tipoDocumento === 'RUC' ? 'Factura' : 'Boleta';
    const fechaEmision = new Date();

    const comprobanteData = {
      tipoComprobante: tipoComprobante,
      fechaEmision: fechaEmision,
      idPedido: Number(pedidoId)
    };

    this.comprobanteService.create(comprobanteData).subscribe({
      next: (res) => {
        console.log('Comprobante creado:', res);
        this.generatePDF(comprobanteData, clienteData, pedidoId, total); // Pasa el total aquí
      },
      error: (err) => {
        console.error('Error al crear el comprobante:', err);
      }
    });
  }

  generatePDF(comprobanteData: any, clienteData: any, pedidoId: number, total: number): void {
    const doc = new jsPDF();
  
    // Configuración del logo (base64 o URL local)
    const logoUrl = 'data:image/png;base64,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';
    const empresaNombre = "FIBERTEL S.A.C.";
    const empresaDireccion = "Jr. Loreto 575 Huancayo - JUNIN";
    const empresaRUC = "20795620618";

    // Calculo del IGV y subtotal sin IGV
    const igvRate = 0.18; // Tasa de IGV
    const subtotalSinIGV = total / (1 + igvRate);
    const igv = total - subtotalSinIGV;
  
    // Añadir logo
    doc.addImage(logoUrl, 'PNG', 20, 10, 30, 30);
  
    // Establecer estilo del encabezado de la empresa
    doc.setFontSize(16);
    doc.text(empresaNombre, 60, 20);
    doc.setFontSize(12);
    doc.text(`Dirección: ${empresaDireccion}`, 60, 30);
    doc.text(`RUC: ${empresaRUC}`, 60, 40);
  
    // Separador 1
    doc.line(20, 45, 190, 45);
  
    // Título del comprobante y detalles
    doc.setFontSize(20);
    doc.text('Comprobante de Venta Electrónico', 20, 55);
  
    doc.setFontSize(12);
    doc.text(`Tipo de Comprobante: ${comprobanteData.tipoComprobante}`, 20, 65);
    doc.text(`Fecha de Emisión: ${comprobanteData.fechaEmision.toLocaleDateString()}`, 20, 70);
    doc.text(`ID de Pedido: ${pedidoId}`, 20, 75);

    // Separador 2
    doc.line(20, 80, 190, 80);
  
    // Información del cliente
    doc.text('Datos del Cliente:', 20, 85);

    // Separador 2.1
    doc.line(20, 87, 190, 87);

    doc.text(`Razón Social: ${clienteData.razonSocial}`, 20, 97);
    doc.text(`Email: ${clienteData.email}`, 20, 107);
    doc.text(`Teléfono: ${clienteData.telefonoMovil}`, 20, 117);
    doc.text(`Tipo Documento: ${clienteData.tipoDocumento}`, 20, 127);
    doc.text(`Número Documento: ${clienteData.numeroDocumento}`, 20, 137);

    // Separador 3
    doc.line(20, 142, 190, 142);
  
    // Detalles del pedido
    doc.text('Detalles del Pedido:', 20, 147);

    // Separador 3
    doc.line(20, 149, 190, 149);

    doc.setFontSize(10);
    let offset = 159;
      this.detallePedidos.forEach((detalle) => {
        doc.text(`Producto: ${detalle.nombreProducto}`, 20, offset);
        doc.text(`Cantidad: ${detalle.cantidad}`, 20, offset + 10);
        doc.text(`Precio Unitario: S/ ${detalle.precioUnitario.toFixed(2)}`, 20, offset + 20);
        doc.text(`Precio Descuento: ${detalle.precioDescuento}`, 20, offset + 30);
        doc.text(`Subtotal: S/ ${(detalle.subtotal).toFixed(2)}`, 20, offset + 40);
        offset += 50;
      });

      // Agrega el subtotal, IGV y total
     
      doc.text(`Subtotal sin IGV: S/ ${subtotalSinIGV.toFixed(2)}`, 20, offset);
     
      doc.text(`IGV (18%): S/ ${igv.toFixed(2)}`, 20, offset + 10);
    
      doc.text(`Total: S/ ${total.toFixed(2)}`, 20, offset + 20);

  
    // Guardar el documento PDF
    doc.save(`comprobante_${comprobanteData.tipoComprobante.toLowerCase()}_${pedidoId}.pdf`);
  
    // Limpiar el local storage
    localStorage.clear();
  }
}