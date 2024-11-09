import {
  Component,
  Deferred,
  ErrorFactory,
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS,
  FirebaseError,
  Logger,
  SDK_VERSION,
  VERSION as VERSION2,
  _getProvider,
  _registerComponent,
  base64,
  createMockUserToken,
  deleteApp,
  firebase,
  getApp,
  getApps,
  getGlobal,
  getModularInstance,
  initializeApp,
  initializeServerApp,
  isIndexedDBAvailable,
  keepUnstableUntilFirst,
  observeOutsideAngular,
  onLog,
  registerVersion,
  setLogLevel,
  uuidv4,
  ɵAPP_CHECK_PROVIDER_NAME,
  ɵAngularFireSchedulers,
  ɵAppCheckInstances,
  ɵcacheInstance,
  ɵfirebaseAppFactory,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵzoneWrap
} from "./chunk-MASH2S6J.js";
import {
  AsyncPipe
} from "./chunk-3ZNNAO5V.js";
import {
  ChangeDetectorRef,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  Pipe,
  TransferState,
  VERSION,
  makeStateKey,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵdirectiveInject,
  ɵɵinject
} from "./chunk-VY4VOVDF.js";
import "./chunk-XPU7EA6D.js";
import "./chunk-QN5HDKTT.js";
import {
  Observable,
  concatMap,
  debounceTime,
  distinct,
  from,
  map,
  of,
  switchMap,
  tap,
  timer
} from "./chunk-MHK6ZZQX.js";
import {
  __async
} from "./chunk-4MWRP73S.js";

// node_modules/@angular/fire/fesm2022/angular-fire-app.mjs
var FirebaseApp = class {
  constructor(app) {
    return app;
  }
};
var FirebaseApps = class {
  constructor() {
    return getApps();
  }
};
var firebaseApp$ = timer(0, 300).pipe(concatMap(() => from(getApps())), distinct());
function defaultFirebaseAppFactory(provided) {
  if (provided && provided.length === 1) {
    return provided[0];
  }
  return new FirebaseApp(getApp());
}
var PROVIDED_FIREBASE_APPS = new InjectionToken("angularfire2._apps");
var DEFAULT_FIREBASE_APP_PROVIDER = {
  provide: FirebaseApp,
  useFactory: defaultFirebaseAppFactory,
  deps: [[new Optional(), PROVIDED_FIREBASE_APPS]]
};
var FIREBASE_APPS_PROVIDER = {
  provide: FirebaseApps,
  deps: [[new Optional(), PROVIDED_FIREBASE_APPS]]
};
var FirebaseAppModule = class _FirebaseAppModule {
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(platformId) {
    registerVersion("angularfire", VERSION2.full, "core");
    registerVersion("angularfire", VERSION2.full, "app");
    registerVersion("angular", VERSION.full, platformId.toString());
  }
  static ɵfac = function FirebaseAppModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _FirebaseAppModule)(ɵɵinject(PLATFORM_ID));
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _FirebaseAppModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_FIREBASE_APP_PROVIDER, FIREBASE_APPS_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FirebaseAppModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_FIREBASE_APP_PROVIDER, FIREBASE_APPS_PROVIDER]
    }]
  }], () => [{
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], null);
})();
var deleteApp2 = ɵzoneWrap(deleteApp, true);
var getApp2 = ɵzoneWrap(getApp, true);
var getApps2 = ɵzoneWrap(getApps, true);
var initializeApp2 = ɵzoneWrap(initializeApp, true);
var initializeServerApp2 = ɵzoneWrap(initializeServerApp, true);
var onLog2 = ɵzoneWrap(onLog, true);
var registerVersion2 = ɵzoneWrap(registerVersion, true);
var setLogLevel2 = ɵzoneWrap(setLogLevel, true);

// node_modules/@firebase/app-check/dist/esm/index.esm2017.js
var APP_CHECK_STATES = /* @__PURE__ */ new Map();
var DEFAULT_STATE = {
  activated: false,
  tokenObservers: []
};
var DEBUG_STATE = {
  initialized: false,
  enabled: false
};
function getStateReference(app) {
  return APP_CHECK_STATES.get(app) || Object.assign({}, DEFAULT_STATE);
}
function setInitialState(app, state) {
  APP_CHECK_STATES.set(app, state);
  return APP_CHECK_STATES.get(app);
}
function getDebugState() {
  return DEBUG_STATE;
}
var BASE_ENDPOINT = "https://content-firebaseappcheck.googleapis.com/v1";
var EXCHANGE_DEBUG_TOKEN_METHOD = "exchangeDebugToken";
var TOKEN_REFRESH_TIME = {
  /**
   * The offset time before token natural expiration to run the refresh.
   * This is currently 5 minutes.
   */
  OFFSET_DURATION: 5 * 60 * 1e3,
  /**
   * This is the first retrial wait after an error. This is currently
   * 30 seconds.
   */
  RETRIAL_MIN_WAIT: 30 * 1e3,
  /**
   * This is the maximum retrial wait, currently 16 minutes.
   */
  RETRIAL_MAX_WAIT: 16 * 60 * 1e3
};
var ONE_DAY = 24 * 60 * 60 * 1e3;
var Refresher = class {
  constructor(operation, retryPolicy, getWaitDuration, lowerBound, upperBound) {
    this.operation = operation;
    this.retryPolicy = retryPolicy;
    this.getWaitDuration = getWaitDuration;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.pending = null;
    this.nextErrorWaitInterval = lowerBound;
    if (lowerBound > upperBound) {
      throw new Error("Proactive refresh lower bound greater than upper bound!");
    }
  }
  start() {
    this.nextErrorWaitInterval = this.lowerBound;
    this.process(true).catch(() => {
    });
  }
  stop() {
    if (this.pending) {
      this.pending.reject("cancelled");
      this.pending = null;
    }
  }
  isRunning() {
    return !!this.pending;
  }
  process(hasSucceeded) {
    return __async(this, null, function* () {
      this.stop();
      try {
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield sleep(this.getNextRun(hasSucceeded));
        this.pending.resolve();
        yield this.pending.promise;
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield this.operation();
        this.pending.resolve();
        yield this.pending.promise;
        this.process(true).catch(() => {
        });
      } catch (error) {
        if (this.retryPolicy(error)) {
          this.process(false).catch(() => {
          });
        } else {
          this.stop();
        }
      }
    });
  }
  getNextRun(hasSucceeded) {
    if (hasSucceeded) {
      this.nextErrorWaitInterval = this.lowerBound;
      return this.getWaitDuration();
    } else {
      const currentErrorWaitInterval = this.nextErrorWaitInterval;
      this.nextErrorWaitInterval *= 2;
      if (this.nextErrorWaitInterval > this.upperBound) {
        this.nextErrorWaitInterval = this.upperBound;
      }
      return currentErrorWaitInterval;
    }
  }
};
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var ERRORS = {
  [
    "already-initialized"
    /* AppCheckError.ALREADY_INITIALIZED */
  ]: "You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.",
  [
    "use-before-activation"
    /* AppCheckError.USE_BEFORE_ACTIVATION */
  ]: "App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.",
  [
    "fetch-network-error"
    /* AppCheckError.FETCH_NETWORK_ERROR */
  ]: "Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
  [
    "fetch-parse-error"
    /* AppCheckError.FETCH_PARSE_ERROR */
  ]: "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
  [
    "fetch-status-error"
    /* AppCheckError.FETCH_STATUS_ERROR */
  ]: "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
  [
    "storage-open"
    /* AppCheckError.STORAGE_OPEN */
  ]: "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
  [
    "storage-get"
    /* AppCheckError.STORAGE_GET */
  ]: "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
  [
    "storage-set"
    /* AppCheckError.STORAGE_WRITE */
  ]: "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
  [
    "recaptcha-error"
    /* AppCheckError.RECAPTCHA_ERROR */
  ]: "ReCAPTCHA error.",
  [
    "throttled"
    /* AppCheckError.THROTTLED */
  ]: `Requests throttled due to {$httpStatus} error. Attempts allowed again after {$time}`
};
var ERROR_FACTORY = new ErrorFactory("appCheck", "AppCheck", ERRORS);
function ensureActivated(app) {
  if (!getStateReference(app).activated) {
    throw ERROR_FACTORY.create("use-before-activation", {
      appName: app.name
    });
  }
}
function exchangeToken(_0, _1) {
  return __async(this, arguments, function* ({
    url,
    body
  }, heartbeatServiceProvider) {
    const headers = {
      "Content-Type": "application/json"
    };
    const heartbeatService = heartbeatServiceProvider.getImmediate({
      optional: true
    });
    if (heartbeatService) {
      const heartbeatsHeader = yield heartbeatService.getHeartbeatsHeader();
      if (heartbeatsHeader) {
        headers["X-Firebase-Client"] = heartbeatsHeader;
      }
    }
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers
    };
    let response;
    try {
      response = yield fetch(url, options);
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-network-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    if (response.status !== 200) {
      throw ERROR_FACTORY.create("fetch-status-error", {
        httpStatus: response.status
      });
    }
    let responseBody;
    try {
      responseBody = yield response.json();
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    const match = responseBody.ttl.match(/^([\d.]+)(s)$/);
    if (!match || !match[2] || isNaN(Number(match[1]))) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${responseBody.ttl}`
      });
    }
    const timeToLiveAsNumber = Number(match[1]) * 1e3;
    const now = Date.now();
    return {
      token: responseBody.token,
      expireTimeMillis: now + timeToLiveAsNumber,
      issuedAtTimeMillis: now
    };
  });
}
function getExchangeDebugTokenRequest(app, debugToken) {
  const {
    projectId,
    appId,
    apiKey
  } = app.options;
  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_DEBUG_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      // eslint-disable-next-line
      debug_token: debugToken
    }
  };
}
var DB_NAME = "firebase-app-check-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-app-check-store";
var DEBUG_TOKEN_KEY = "debug-token";
var dbPromise = null;
function getDBPromise() {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-open", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        switch (event.oldVersion) {
          case 0:
            db.createObjectStore(STORE_NAME, {
              keyPath: "compositeKey"
            });
        }
      };
    } catch (e) {
      reject(ERROR_FACTORY.create("storage-open", {
        originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
      }));
    }
  });
  return dbPromise;
}
function readTokenFromIndexedDB(app) {
  return read(computeKey(app));
}
function writeTokenToIndexedDB(app, token) {
  return write(computeKey(app), token);
}
function writeDebugTokenToIndexedDB(token) {
  return write(DEBUG_TOKEN_KEY, token);
}
function readDebugTokenFromIndexedDB() {
  return read(DEBUG_TOKEN_KEY);
}
function write(key, value) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      compositeKey: key,
      value
    });
    return new Promise((resolve, reject) => {
      request.onsuccess = (_event) => {
        resolve();
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-set", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function read(key) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(result.value);
        } else {
          resolve(void 0);
        }
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-get", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function computeKey(app) {
  return `${app.options.appId}-${app.name}`;
}
var logger = new Logger("@firebase/app-check");
function readTokenFromStorage(app) {
  return __async(this, null, function* () {
    if (isIndexedDBAvailable()) {
      let token = void 0;
      try {
        token = yield readTokenFromIndexedDB(app);
      } catch (e) {
        logger.warn(`Failed to read token from IndexedDB. Error: ${e}`);
      }
      return token;
    }
    return void 0;
  });
}
function writeTokenToStorage(app, token) {
  if (isIndexedDBAvailable()) {
    return writeTokenToIndexedDB(app, token).catch((e) => {
      logger.warn(`Failed to write token to IndexedDB. Error: ${e}`);
    });
  }
  return Promise.resolve();
}
function readOrCreateDebugTokenFromStorage() {
  return __async(this, null, function* () {
    let existingDebugToken = void 0;
    try {
      existingDebugToken = yield readDebugTokenFromIndexedDB();
    } catch (_e) {
    }
    if (!existingDebugToken) {
      const newToken = uuidv4();
      writeDebugTokenToIndexedDB(newToken).catch((e) => logger.warn(`Failed to persist debug token to IndexedDB. Error: ${e}`));
      return newToken;
    } else {
      return existingDebugToken;
    }
  });
}
function isDebugMode() {
  const debugState = getDebugState();
  return debugState.enabled;
}
function getDebugToken() {
  return __async(this, null, function* () {
    const state = getDebugState();
    if (state.enabled && state.token) {
      return state.token.promise;
    } else {
      throw Error(`
            Can't get debug token in production mode.
        `);
    }
  });
}
function initializeDebugMode() {
  const globals = getGlobal();
  const debugState = getDebugState();
  debugState.initialized = true;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== "string" && globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== true) {
    return;
  }
  debugState.enabled = true;
  const deferredToken = new Deferred();
  debugState.token = deferredToken;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN === "string") {
    deferredToken.resolve(globals.FIREBASE_APPCHECK_DEBUG_TOKEN);
  } else {
    deferredToken.resolve(readOrCreateDebugTokenFromStorage());
  }
}
var defaultTokenErrorData = {
  error: "UNKNOWN_ERROR"
};
function formatDummyToken(tokenErrorData) {
  return base64.encodeString(
    JSON.stringify(tokenErrorData),
    /* webSafe= */
    false
  );
}
function getToken$2(appCheck, forceRefresh = false) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const state = getStateReference(app);
    let token = state.token;
    let error = void 0;
    if (token && !isValid(token)) {
      state.token = void 0;
      token = void 0;
    }
    if (!token) {
      const cachedToken = yield state.cachedTokenPromise;
      if (cachedToken) {
        if (isValid(cachedToken)) {
          token = cachedToken;
        } else {
          yield writeTokenToStorage(app, void 0);
        }
      }
    }
    if (!forceRefresh && token && isValid(token)) {
      return {
        token: token.token
      };
    }
    let shouldCallListeners = false;
    if (isDebugMode()) {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = exchangeToken(getExchangeDebugTokenRequest(app, yield getDebugToken()), appCheck.heartbeatServiceProvider).finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      const tokenFromDebugExchange = yield state.exchangeTokenPromise;
      yield writeTokenToStorage(app, tokenFromDebugExchange);
      state.token = tokenFromDebugExchange;
      return {
        token: tokenFromDebugExchange.token
      };
    }
    try {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = state.provider.getToken().finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      token = yield getStateReference(app).exchangeTokenPromise;
    } catch (e) {
      if (e.code === `appCheck/${"throttled"}`) {
        logger.warn(e.message);
      } else {
        logger.error(e);
      }
      error = e;
    }
    let interopTokenResult;
    if (!token) {
      interopTokenResult = makeDummyTokenResult(error);
    } else if (error) {
      if (isValid(token)) {
        interopTokenResult = {
          token: token.token,
          internalError: error
        };
      } else {
        interopTokenResult = makeDummyTokenResult(error);
      }
    } else {
      interopTokenResult = {
        token: token.token
      };
      state.token = token;
      yield writeTokenToStorage(app, token);
    }
    if (shouldCallListeners) {
      notifyTokenListeners(app, interopTokenResult);
    }
    return interopTokenResult;
  });
}
function getLimitedUseToken$1(appCheck) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const {
      provider
    } = getStateReference(app);
    if (isDebugMode()) {
      const debugToken = yield getDebugToken();
      const {
        token
      } = yield exchangeToken(getExchangeDebugTokenRequest(app, debugToken), appCheck.heartbeatServiceProvider);
      return {
        token
      };
    } else {
      const {
        token
      } = yield provider.getToken();
      return {
        token
      };
    }
  });
}
function addTokenListener(appCheck, type, listener, onError) {
  const {
    app
  } = appCheck;
  const state = getStateReference(app);
  const tokenObserver = {
    next: listener,
    error: onError,
    type
  };
  state.tokenObservers = [...state.tokenObservers, tokenObserver];
  if (state.token && isValid(state.token)) {
    const validToken = state.token;
    Promise.resolve().then(() => {
      listener({
        token: validToken.token
      });
      initTokenRefresher(appCheck);
    }).catch(() => {
    });
  }
  void state.cachedTokenPromise.then(() => initTokenRefresher(appCheck));
}
function removeTokenListener(app, listener) {
  const state = getStateReference(app);
  const newObservers = state.tokenObservers.filter((tokenObserver) => tokenObserver.next !== listener);
  if (newObservers.length === 0 && state.tokenRefresher && state.tokenRefresher.isRunning()) {
    state.tokenRefresher.stop();
  }
  state.tokenObservers = newObservers;
}
function initTokenRefresher(appCheck) {
  const {
    app
  } = appCheck;
  const state = getStateReference(app);
  let refresher = state.tokenRefresher;
  if (!refresher) {
    refresher = createTokenRefresher(appCheck);
    state.tokenRefresher = refresher;
  }
  if (!refresher.isRunning() && state.isTokenAutoRefreshEnabled) {
    refresher.start();
  }
}
function createTokenRefresher(appCheck) {
  const {
    app
  } = appCheck;
  return new Refresher(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    () => __async(this, null, function* () {
      const state = getStateReference(app);
      let result;
      if (!state.token) {
        result = yield getToken$2(appCheck);
      } else {
        result = yield getToken$2(appCheck, true);
      }
      if (result.error) {
        throw result.error;
      }
      if (result.internalError) {
        throw result.internalError;
      }
    }),
    () => {
      return true;
    },
    () => {
      const state = getStateReference(app);
      if (state.token) {
        let nextRefreshTimeMillis = state.token.issuedAtTimeMillis + (state.token.expireTimeMillis - state.token.issuedAtTimeMillis) * 0.5 + 5 * 60 * 1e3;
        const latestAllowableRefresh = state.token.expireTimeMillis - 5 * 60 * 1e3;
        nextRefreshTimeMillis = Math.min(nextRefreshTimeMillis, latestAllowableRefresh);
        return Math.max(0, nextRefreshTimeMillis - Date.now());
      } else {
        return 0;
      }
    },
    TOKEN_REFRESH_TIME.RETRIAL_MIN_WAIT,
    TOKEN_REFRESH_TIME.RETRIAL_MAX_WAIT
  );
}
function notifyTokenListeners(app, token) {
  const observers = getStateReference(app).tokenObservers;
  for (const observer of observers) {
    try {
      if (observer.type === "EXTERNAL" && token.error != null) {
        observer.error(token.error);
      } else {
        observer.next(token);
      }
    } catch (e) {
    }
  }
}
function isValid(token) {
  return token.expireTimeMillis - Date.now() > 0;
}
function makeDummyTokenResult(error) {
  return {
    token: formatDummyToken(defaultTokenErrorData),
    error
  };
}
var AppCheckService = class {
  constructor(app, heartbeatServiceProvider) {
    this.app = app;
    this.heartbeatServiceProvider = heartbeatServiceProvider;
  }
  _delete() {
    const {
      tokenObservers
    } = getStateReference(this.app);
    for (const tokenObserver of tokenObservers) {
      removeTokenListener(this.app, tokenObserver.next);
    }
    return Promise.resolve();
  }
};
function factory(app, heartbeatServiceProvider) {
  return new AppCheckService(app, heartbeatServiceProvider);
}
function internalFactory(appCheck) {
  return {
    getToken: (forceRefresh) => getToken$2(appCheck, forceRefresh),
    getLimitedUseToken: () => getLimitedUseToken$1(appCheck),
    addTokenListener: (listener) => addTokenListener(appCheck, "INTERNAL", listener),
    removeTokenListener: (listener) => removeTokenListener(appCheck.app, listener)
  };
}
var name = "@firebase/app-check";
var version = "0.8.8";
function initializeAppCheck(app = getApp(), options) {
  app = getModularInstance(app);
  const provider = _getProvider(app, "app-check");
  if (!getDebugState().initialized) {
    initializeDebugMode();
  }
  if (isDebugMode()) {
    void getDebugToken().then((token) => (
      // Not using logger because I don't think we ever want this accidentally hidden.
      console.log(`App Check debug token: ${token}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)
    ));
  }
  if (provider.isInitialized()) {
    const existingInstance = provider.getImmediate();
    const initialOptions = provider.getOptions();
    if (initialOptions.isTokenAutoRefreshEnabled === options.isTokenAutoRefreshEnabled && initialOptions.provider.isEqual(options.provider)) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create("already-initialized", {
        appName: app.name
      });
    }
  }
  const appCheck = provider.initialize({
    options
  });
  _activate(app, options.provider, options.isTokenAutoRefreshEnabled);
  if (getStateReference(app).isTokenAutoRefreshEnabled) {
    addTokenListener(appCheck, "INTERNAL", () => {
    });
  }
  return appCheck;
}
function _activate(app, provider, isTokenAutoRefreshEnabled) {
  const state = setInitialState(app, Object.assign({}, DEFAULT_STATE));
  state.activated = true;
  state.provider = provider;
  state.cachedTokenPromise = readTokenFromStorage(app).then((cachedToken) => {
    if (cachedToken && isValid(cachedToken)) {
      state.token = cachedToken;
      notifyTokenListeners(app, {
        token: cachedToken.token
      });
    }
    return cachedToken;
  });
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled === void 0 ? app.automaticDataCollectionEnabled : isTokenAutoRefreshEnabled;
  state.provider.initialize(app);
}
function setTokenAutoRefreshEnabled(appCheckInstance, isTokenAutoRefreshEnabled) {
  const app = appCheckInstance.app;
  const state = getStateReference(app);
  if (state.tokenRefresher) {
    if (isTokenAutoRefreshEnabled === true) {
      state.tokenRefresher.start();
    } else {
      state.tokenRefresher.stop();
    }
  }
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}
function getToken(appCheckInstance, forceRefresh) {
  return __async(this, null, function* () {
    const result = yield getToken$2(appCheckInstance, forceRefresh);
    if (result.error) {
      throw result.error;
    }
    return {
      token: result.token
    };
  });
}
function getLimitedUseToken(appCheckInstance) {
  return getLimitedUseToken$1(appCheckInstance);
}
function onTokenChanged(appCheckInstance, onNextOrObserver, onError, onCompletion) {
  let nextFn = () => {
  };
  let errorFn = () => {
  };
  if (onNextOrObserver.next != null) {
    nextFn = onNextOrObserver.next.bind(onNextOrObserver);
  } else {
    nextFn = onNextOrObserver;
  }
  if (onNextOrObserver.error != null) {
    errorFn = onNextOrObserver.error.bind(onNextOrObserver);
  } else if (onError) {
    errorFn = onError;
  }
  addTokenListener(appCheckInstance, "EXTERNAL", nextFn, errorFn);
  return () => removeTokenListener(appCheckInstance.app, nextFn);
}
var APP_CHECK_NAME = "app-check";
var APP_CHECK_NAME_INTERNAL = "app-check-internal";
function registerAppCheck() {
  _registerComponent(new Component(
    APP_CHECK_NAME,
    (container) => {
      const app = container.getProvider("app").getImmediate();
      const heartbeatServiceProvider = container.getProvider("heartbeat");
      return factory(app, heartbeatServiceProvider);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((container, _identifier, _appcheckService) => {
    container.getProvider(APP_CHECK_NAME_INTERNAL).initialize();
  }));
  _registerComponent(new Component(
    APP_CHECK_NAME_INTERNAL,
    (container) => {
      const appCheck = container.getProvider("app-check").getImmediate();
      return internalFactory(appCheck);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ));
  registerVersion(name, version);
}
registerAppCheck();

// node_modules/@angular/fire/fesm2022/angular-fire-app-check.mjs
var AppCheck = class {
  constructor(appCheck) {
    return appCheck;
  }
};
var appCheckInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(ɵAPP_CHECK_PROVIDER_NAME))), distinct());
var PROVIDED_APP_CHECK_INSTANCES = new InjectionToken("angularfire2.app-check-instances");
function defaultAppCheckInstanceFactory(provided, defaultApp) {
  const defaultAppCheck = ɵgetDefaultInstanceOf(ɵAPP_CHECK_PROVIDER_NAME, provided, defaultApp);
  return defaultAppCheck && new AppCheck(defaultAppCheck);
}
var LOCALHOSTS = ["localhost", "0.0.0.0", "127.0.0.1"];
var isLocalhost = typeof window !== "undefined" && LOCALHOSTS.includes(window.location.hostname);
var APP_CHECK_INSTANCES_PROVIDER = {
  provide: ɵAppCheckInstances,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES]]
};
var DEFAULT_APP_CHECK_INSTANCE_PROVIDER = {
  provide: AppCheck,
  useFactory: defaultAppCheckInstanceFactory,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES], FirebaseApp, PLATFORM_ID]
};
var AppCheckModule = class _AppCheckModule {
  constructor() {
    registerVersion("angularfire", VERSION2.full, "app-check");
  }
  static ɵfac = function AppCheckModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppCheckModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AppCheckModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppCheckModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
    }]
  }], () => [], null);
})();
var getLimitedUseToken2 = ɵzoneWrap(getLimitedUseToken, true);
var getToken2 = ɵzoneWrap(getToken, true);
var initializeAppCheck2 = ɵzoneWrap(initializeAppCheck, true);
var onTokenChanged2 = ɵzoneWrap(onTokenChanged, true);
var setTokenAutoRefreshEnabled2 = ɵzoneWrap(setTokenAutoRefreshEnabled, true);

// node_modules/@firebase/storage/dist/index.esm2017.js
var DEFAULT_HOST = "firebasestorage.googleapis.com";
var CONFIG_STORAGE_BUCKET_KEY = "storageBucket";
var DEFAULT_MAX_OPERATION_RETRY_TIME = 2 * 60 * 1e3;
var DEFAULT_MAX_UPLOAD_RETRY_TIME = 10 * 60 * 1e3;
var DEFAULT_MIN_SLEEP_TIME_MILLIS = 1e3;
var StorageError = class _StorageError extends FirebaseError {
  /**
   * @param code - A `StorageErrorCode` string to be prefixed with 'storage/' and
   *  added to the end of the message.
   * @param message  - Error message.
   * @param status_ - Corresponding HTTP Status Code
   */
  constructor(code, message, status_ = 0) {
    super(prependCode(code), `Firebase Storage: ${message} (${prependCode(code)})`);
    this.status_ = status_;
    this.customData = {
      serverResponse: null
    };
    this._baseMessage = this.message;
    Object.setPrototypeOf(this, _StorageError.prototype);
  }
  get status() {
    return this.status_;
  }
  set status(status) {
    this.status_ = status;
  }
  /**
   * Compares a `StorageErrorCode` against this error's code, filtering out the prefix.
   */
  _codeEquals(code) {
    return prependCode(code) === this.code;
  }
  /**
   * Optional response message that was added by the server.
   */
  get serverResponse() {
    return this.customData.serverResponse;
  }
  set serverResponse(serverResponse) {
    this.customData.serverResponse = serverResponse;
    if (this.customData.serverResponse) {
      this.message = `${this._baseMessage}
${this.customData.serverResponse}`;
    } else {
      this.message = this._baseMessage;
    }
  }
};
var StorageErrorCode;
(function(StorageErrorCode2) {
  StorageErrorCode2["UNKNOWN"] = "unknown";
  StorageErrorCode2["OBJECT_NOT_FOUND"] = "object-not-found";
  StorageErrorCode2["BUCKET_NOT_FOUND"] = "bucket-not-found";
  StorageErrorCode2["PROJECT_NOT_FOUND"] = "project-not-found";
  StorageErrorCode2["QUOTA_EXCEEDED"] = "quota-exceeded";
  StorageErrorCode2["UNAUTHENTICATED"] = "unauthenticated";
  StorageErrorCode2["UNAUTHORIZED"] = "unauthorized";
  StorageErrorCode2["UNAUTHORIZED_APP"] = "unauthorized-app";
  StorageErrorCode2["RETRY_LIMIT_EXCEEDED"] = "retry-limit-exceeded";
  StorageErrorCode2["INVALID_CHECKSUM"] = "invalid-checksum";
  StorageErrorCode2["CANCELED"] = "canceled";
  StorageErrorCode2["INVALID_EVENT_NAME"] = "invalid-event-name";
  StorageErrorCode2["INVALID_URL"] = "invalid-url";
  StorageErrorCode2["INVALID_DEFAULT_BUCKET"] = "invalid-default-bucket";
  StorageErrorCode2["NO_DEFAULT_BUCKET"] = "no-default-bucket";
  StorageErrorCode2["CANNOT_SLICE_BLOB"] = "cannot-slice-blob";
  StorageErrorCode2["SERVER_FILE_WRONG_SIZE"] = "server-file-wrong-size";
  StorageErrorCode2["NO_DOWNLOAD_URL"] = "no-download-url";
  StorageErrorCode2["INVALID_ARGUMENT"] = "invalid-argument";
  StorageErrorCode2["INVALID_ARGUMENT_COUNT"] = "invalid-argument-count";
  StorageErrorCode2["APP_DELETED"] = "app-deleted";
  StorageErrorCode2["INVALID_ROOT_OPERATION"] = "invalid-root-operation";
  StorageErrorCode2["INVALID_FORMAT"] = "invalid-format";
  StorageErrorCode2["INTERNAL_ERROR"] = "internal-error";
  StorageErrorCode2["UNSUPPORTED_ENVIRONMENT"] = "unsupported-environment";
})(StorageErrorCode || (StorageErrorCode = {}));
function prependCode(code) {
  return "storage/" + code;
}
function unknown() {
  const message = "An unknown error occurred, please check the error payload for server response.";
  return new StorageError(StorageErrorCode.UNKNOWN, message);
}
function objectNotFound(path) {
  return new StorageError(StorageErrorCode.OBJECT_NOT_FOUND, "Object '" + path + "' does not exist.");
}
function quotaExceeded(bucket) {
  return new StorageError(StorageErrorCode.QUOTA_EXCEEDED, "Quota for bucket '" + bucket + "' exceeded, please view quota on https://firebase.google.com/pricing/.");
}
function unauthenticated() {
  const message = "User is not authenticated, please authenticate using Firebase Authentication and try again.";
  return new StorageError(StorageErrorCode.UNAUTHENTICATED, message);
}
function unauthorizedApp() {
  return new StorageError(StorageErrorCode.UNAUTHORIZED_APP, "This app does not have permission to access Firebase Storage on this project.");
}
function unauthorized(path) {
  return new StorageError(StorageErrorCode.UNAUTHORIZED, "User does not have permission to access '" + path + "'.");
}
function retryLimitExceeded() {
  return new StorageError(StorageErrorCode.RETRY_LIMIT_EXCEEDED, "Max retry time for operation exceeded, please try again.");
}
function canceled() {
  return new StorageError(StorageErrorCode.CANCELED, "User canceled the upload/download.");
}
function invalidUrl(url) {
  return new StorageError(StorageErrorCode.INVALID_URL, "Invalid URL '" + url + "'.");
}
function invalidDefaultBucket(bucket) {
  return new StorageError(StorageErrorCode.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + bucket + "'.");
}
function noDefaultBucket() {
  return new StorageError(StorageErrorCode.NO_DEFAULT_BUCKET, "No default bucket found. Did you set the '" + CONFIG_STORAGE_BUCKET_KEY + "' property when initializing the app?");
}
function cannotSliceBlob() {
  return new StorageError(StorageErrorCode.CANNOT_SLICE_BLOB, "Cannot slice blob for upload. Please retry the upload.");
}
function serverFileWrongSize() {
  return new StorageError(StorageErrorCode.SERVER_FILE_WRONG_SIZE, "Server recorded incorrect upload file size, please retry the upload.");
}
function noDownloadURL() {
  return new StorageError(StorageErrorCode.NO_DOWNLOAD_URL, "The given file does not have any download URLs.");
}
function missingPolyFill(polyFill) {
  return new StorageError(StorageErrorCode.UNSUPPORTED_ENVIRONMENT, `${polyFill} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`);
}
function invalidArgument(message) {
  return new StorageError(StorageErrorCode.INVALID_ARGUMENT, message);
}
function appDeleted() {
  return new StorageError(StorageErrorCode.APP_DELETED, "The Firebase app was deleted.");
}
function invalidRootOperation(name4) {
  return new StorageError(StorageErrorCode.INVALID_ROOT_OPERATION, "The operation '" + name4 + "' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");
}
function invalidFormat(format, message) {
  return new StorageError(StorageErrorCode.INVALID_FORMAT, "String does not match format '" + format + "': " + message);
}
function internalError(message) {
  throw new StorageError(StorageErrorCode.INTERNAL_ERROR, "Internal error: " + message);
}
var Location = class _Location {
  constructor(bucket, path) {
    this.bucket = bucket;
    this.path_ = path;
  }
  get path() {
    return this.path_;
  }
  get isRoot() {
    return this.path.length === 0;
  }
  fullServerUrl() {
    const encode = encodeURIComponent;
    return "/b/" + encode(this.bucket) + "/o/" + encode(this.path);
  }
  bucketOnlyServerUrl() {
    const encode = encodeURIComponent;
    return "/b/" + encode(this.bucket) + "/o";
  }
  static makeFromBucketSpec(bucketString, host) {
    let bucketLocation;
    try {
      bucketLocation = _Location.makeFromUrl(bucketString, host);
    } catch (e) {
      return new _Location(bucketString, "");
    }
    if (bucketLocation.path === "") {
      return bucketLocation;
    } else {
      throw invalidDefaultBucket(bucketString);
    }
  }
  static makeFromUrl(url, host) {
    let location = null;
    const bucketDomain = "([A-Za-z0-9.\\-_]+)";
    function gsModify(loc) {
      if (loc.path.charAt(loc.path.length - 1) === "/") {
        loc.path_ = loc.path_.slice(0, -1);
      }
    }
    const gsPath = "(/(.*))?$";
    const gsRegex = new RegExp("^gs://" + bucketDomain + gsPath, "i");
    const gsIndices = {
      bucket: 1,
      path: 3
    };
    function httpModify(loc) {
      loc.path_ = decodeURIComponent(loc.path);
    }
    const version4 = "v[A-Za-z0-9_]+";
    const firebaseStorageHost = host.replace(/[.]/g, "\\.");
    const firebaseStoragePath = "(/([^?#]*).*)?$";
    const firebaseStorageRegExp = new RegExp(`^https?://${firebaseStorageHost}/${version4}/b/${bucketDomain}/o${firebaseStoragePath}`, "i");
    const firebaseStorageIndices = {
      bucket: 1,
      path: 3
    };
    const cloudStorageHost = host === DEFAULT_HOST ? "(?:storage.googleapis.com|storage.cloud.google.com)" : host;
    const cloudStoragePath = "([^?#]*)";
    const cloudStorageRegExp = new RegExp(`^https?://${cloudStorageHost}/${bucketDomain}/${cloudStoragePath}`, "i");
    const cloudStorageIndices = {
      bucket: 1,
      path: 2
    };
    const groups = [{
      regex: gsRegex,
      indices: gsIndices,
      postModify: gsModify
    }, {
      regex: firebaseStorageRegExp,
      indices: firebaseStorageIndices,
      postModify: httpModify
    }, {
      regex: cloudStorageRegExp,
      indices: cloudStorageIndices,
      postModify: httpModify
    }];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const captures = group.regex.exec(url);
      if (captures) {
        const bucketValue = captures[group.indices.bucket];
        let pathValue = captures[group.indices.path];
        if (!pathValue) {
          pathValue = "";
        }
        location = new _Location(bucketValue, pathValue);
        group.postModify(location);
        break;
      }
    }
    if (location == null) {
      throw invalidUrl(url);
    }
    return location;
  }
};
var FailRequest = class {
  constructor(error) {
    this.promise_ = Promise.reject(error);
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(_appDelete = false) {
  }
};
function start(doRequest, backoffCompleteCb, timeout) {
  let waitSeconds = 1;
  let retryTimeoutId = null;
  let globalTimeoutId = null;
  let hitTimeout = false;
  let cancelState = 0;
  function canceled2() {
    return cancelState === 2;
  }
  let triggeredCallback = false;
  function triggerCallback(...args) {
    if (!triggeredCallback) {
      triggeredCallback = true;
      backoffCompleteCb.apply(null, args);
    }
  }
  function callWithDelay(millis) {
    retryTimeoutId = setTimeout(() => {
      retryTimeoutId = null;
      doRequest(responseHandler, canceled2());
    }, millis);
  }
  function clearGlobalTimeout() {
    if (globalTimeoutId) {
      clearTimeout(globalTimeoutId);
    }
  }
  function responseHandler(success, ...args) {
    if (triggeredCallback) {
      clearGlobalTimeout();
      return;
    }
    if (success) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    const mustStop = canceled2() || hitTimeout;
    if (mustStop) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    if (waitSeconds < 64) {
      waitSeconds *= 2;
    }
    let waitMillis;
    if (cancelState === 1) {
      cancelState = 2;
      waitMillis = 0;
    } else {
      waitMillis = (waitSeconds + Math.random()) * 1e3;
    }
    callWithDelay(waitMillis);
  }
  let stopped = false;
  function stop2(wasTimeout) {
    if (stopped) {
      return;
    }
    stopped = true;
    clearGlobalTimeout();
    if (triggeredCallback) {
      return;
    }
    if (retryTimeoutId !== null) {
      if (!wasTimeout) {
        cancelState = 2;
      }
      clearTimeout(retryTimeoutId);
      callWithDelay(0);
    } else {
      if (!wasTimeout) {
        cancelState = 1;
      }
    }
  }
  callWithDelay(0);
  globalTimeoutId = setTimeout(() => {
    hitTimeout = true;
    stop2(true);
  }, timeout);
  return stop2;
}
function stop(id) {
  id(false);
}
function isJustDef(p) {
  return p !== void 0;
}
function isFunction(p) {
  return typeof p === "function";
}
function isNonArrayObject(p) {
  return typeof p === "object" && !Array.isArray(p);
}
function isString(p) {
  return typeof p === "string" || p instanceof String;
}
function isNativeBlob(p) {
  return isNativeBlobDefined() && p instanceof Blob;
}
function isNativeBlobDefined() {
  return typeof Blob !== "undefined";
}
function validateNumber(argument, minValue, maxValue, value) {
  if (value < minValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${minValue} or greater.`);
  }
  if (value > maxValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${maxValue} or less.`);
  }
}
function makeUrl(urlPart, host, protocol) {
  let origin = host;
  if (protocol == null) {
    origin = `https://${host}`;
  }
  return `${protocol}://${origin}/v0${urlPart}`;
}
function makeQueryString(params) {
  const encode = encodeURIComponent;
  let queryPart = "?";
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const nextPart = encode(key) + "=" + encode(params[key]);
      queryPart = queryPart + nextPart + "&";
    }
  }
  queryPart = queryPart.slice(0, -1);
  return queryPart;
}
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["NO_ERROR"] = 0] = "NO_ERROR";
  ErrorCode2[ErrorCode2["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
  ErrorCode2[ErrorCode2["ABORT"] = 2] = "ABORT";
})(ErrorCode || (ErrorCode = {}));
function isRetryStatusCode(status, additionalRetryCodes) {
  const isFiveHundredCode = status >= 500 && status < 600;
  const extraRetryCodes = [
    // Request Timeout: web server didn't receive full request in time.
    408,
    // Too Many Requests: you're getting rate-limited, basically.
    429
  ];
  const isExtraRetryCode = extraRetryCodes.indexOf(status) !== -1;
  const isAdditionalRetryCode = additionalRetryCodes.indexOf(status) !== -1;
  return isFiveHundredCode || isExtraRetryCode || isAdditionalRetryCode;
}
var NetworkRequest = class {
  constructor(url_, method_, headers_, body_, successCodes_, additionalRetryCodes_, callback_, errorCallback_, timeout_, progressCallback_, connectionFactory_, retry = true) {
    this.url_ = url_;
    this.method_ = method_;
    this.headers_ = headers_;
    this.body_ = body_;
    this.successCodes_ = successCodes_;
    this.additionalRetryCodes_ = additionalRetryCodes_;
    this.callback_ = callback_;
    this.errorCallback_ = errorCallback_;
    this.timeout_ = timeout_;
    this.progressCallback_ = progressCallback_;
    this.connectionFactory_ = connectionFactory_;
    this.retry = retry;
    this.pendingConnection_ = null;
    this.backoffId_ = null;
    this.canceled_ = false;
    this.appDelete_ = false;
    this.promise_ = new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
      this.start_();
    });
  }
  /**
   * Actually starts the retry loop.
   */
  start_() {
    const doTheRequest = (backoffCallback, canceled2) => {
      if (canceled2) {
        backoffCallback(false, new RequestEndStatus(false, null, true));
        return;
      }
      const connection = this.connectionFactory_();
      this.pendingConnection_ = connection;
      const progressListener = (progressEvent) => {
        const loaded = progressEvent.loaded;
        const total = progressEvent.lengthComputable ? progressEvent.total : -1;
        if (this.progressCallback_ !== null) {
          this.progressCallback_(loaded, total);
        }
      };
      if (this.progressCallback_ !== null) {
        connection.addUploadProgressListener(progressListener);
      }
      connection.send(this.url_, this.method_, this.body_, this.headers_).then(() => {
        if (this.progressCallback_ !== null) {
          connection.removeUploadProgressListener(progressListener);
        }
        this.pendingConnection_ = null;
        const hitServer = connection.getErrorCode() === ErrorCode.NO_ERROR;
        const status = connection.getStatus();
        if (!hitServer || isRetryStatusCode(status, this.additionalRetryCodes_) && this.retry) {
          const wasCanceled = connection.getErrorCode() === ErrorCode.ABORT;
          backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
          return;
        }
        const successCode = this.successCodes_.indexOf(status) !== -1;
        backoffCallback(true, new RequestEndStatus(successCode, connection));
      });
    };
    const backoffDone = (requestWentThrough, status) => {
      const resolve = this.resolve_;
      const reject = this.reject_;
      const connection = status.connection;
      if (status.wasSuccessCode) {
        try {
          const result = this.callback_(connection, connection.getResponse());
          if (isJustDef(result)) {
            resolve(result);
          } else {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      } else {
        if (connection !== null) {
          const err = unknown();
          err.serverResponse = connection.getErrorText();
          if (this.errorCallback_) {
            reject(this.errorCallback_(connection, err));
          } else {
            reject(err);
          }
        } else {
          if (status.canceled) {
            const err = this.appDelete_ ? appDeleted() : canceled();
            reject(err);
          } else {
            const err = retryLimitExceeded();
            reject(err);
          }
        }
      }
    };
    if (this.canceled_) {
      backoffDone(false, new RequestEndStatus(false, null, true));
    } else {
      this.backoffId_ = start(doTheRequest, backoffDone, this.timeout_);
    }
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(appDelete) {
    this.canceled_ = true;
    this.appDelete_ = appDelete || false;
    if (this.backoffId_ !== null) {
      stop(this.backoffId_);
    }
    if (this.pendingConnection_ !== null) {
      this.pendingConnection_.abort();
    }
  }
};
var RequestEndStatus = class {
  constructor(wasSuccessCode, connection, canceled2) {
    this.wasSuccessCode = wasSuccessCode;
    this.connection = connection;
    this.canceled = !!canceled2;
  }
};
function addAuthHeader_(headers, authToken) {
  if (authToken !== null && authToken.length > 0) {
    headers["Authorization"] = "Firebase " + authToken;
  }
}
function addVersionHeader_(headers, firebaseVersion) {
  headers["X-Firebase-Storage-Version"] = "webjs/" + (firebaseVersion !== null && firebaseVersion !== void 0 ? firebaseVersion : "AppManager");
}
function addGmpidHeader_(headers, appId) {
  if (appId) {
    headers["X-Firebase-GMPID"] = appId;
  }
}
function addAppCheckHeader_(headers, appCheckToken) {
  if (appCheckToken !== null) {
    headers["X-Firebase-AppCheck"] = appCheckToken;
  }
}
function makeRequest(requestInfo, appId, authToken, appCheckToken, requestFactory, firebaseVersion, retry = true) {
  const queryPart = makeQueryString(requestInfo.urlParams);
  const url = requestInfo.url + queryPart;
  const headers = Object.assign({}, requestInfo.headers);
  addGmpidHeader_(headers, appId);
  addAuthHeader_(headers, authToken);
  addVersionHeader_(headers, firebaseVersion);
  addAppCheckHeader_(headers, appCheckToken);
  return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, requestFactory, retry);
}
function getBlobBuilder() {
  if (typeof BlobBuilder !== "undefined") {
    return BlobBuilder;
  } else if (typeof WebKitBlobBuilder !== "undefined") {
    return WebKitBlobBuilder;
  } else {
    return void 0;
  }
}
function getBlob$1(...args) {
  const BlobBuilder2 = getBlobBuilder();
  if (BlobBuilder2 !== void 0) {
    const bb = new BlobBuilder2();
    for (let i = 0; i < args.length; i++) {
      bb.append(args[i]);
    }
    return bb.getBlob();
  } else {
    if (isNativeBlobDefined()) {
      return new Blob(args);
    } else {
      throw new StorageError(StorageErrorCode.UNSUPPORTED_ENVIRONMENT, "This browser doesn't seem to support creating Blobs");
    }
  }
}
function sliceBlob(blob, start2, end) {
  if (blob.webkitSlice) {
    return blob.webkitSlice(start2, end);
  } else if (blob.mozSlice) {
    return blob.mozSlice(start2, end);
  } else if (blob.slice) {
    return blob.slice(start2, end);
  }
  return null;
}
function decodeBase64(encoded) {
  if (typeof atob === "undefined") {
    throw missingPolyFill("base-64");
  }
  return atob(encoded);
}
var StringFormat = {
  /**
   * Indicates the string should be interpreted "raw", that is, as normal text.
   * The string will be interpreted as UTF-16, then uploaded as a UTF-8 byte
   * sequence.
   * Example: The string 'Hello! \\ud83d\\ude0a' becomes the byte sequence
   * 48 65 6c 6c 6f 21 20 f0 9f 98 8a
   */
  RAW: "raw",
  /**
   * Indicates the string should be interpreted as base64-encoded data.
   * Padding characters (trailing '='s) are optional.
   * Example: The string 'rWmO++E6t7/rlw==' becomes the byte sequence
   * ad 69 8e fb e1 3a b7 bf eb 97
   */
  BASE64: "base64",
  /**
   * Indicates the string should be interpreted as base64url-encoded data.
   * Padding characters (trailing '='s) are optional.
   * Example: The string 'rWmO--E6t7_rlw==' becomes the byte sequence
   * ad 69 8e fb e1 3a b7 bf eb 97
   */
  BASE64URL: "base64url",
  /**
   * Indicates the string is a data URL, such as one obtained from
   * canvas.toDataURL().
   * Example: the string 'data:application/octet-stream;base64,aaaa'
   * becomes the byte sequence
   * 69 a6 9a
   * (the content-type "application/octet-stream" is also applied, but can
   * be overridden in the metadata object).
   */
  DATA_URL: "data_url"
};
var StringData = class {
  constructor(data, contentType) {
    this.data = data;
    this.contentType = contentType || null;
  }
};
function dataFromString(format, stringData) {
  switch (format) {
    case StringFormat.RAW:
      return new StringData(utf8Bytes_(stringData));
    case StringFormat.BASE64:
    case StringFormat.BASE64URL:
      return new StringData(base64Bytes_(format, stringData));
    case StringFormat.DATA_URL:
      return new StringData(dataURLBytes_(stringData), dataURLContentType_(stringData));
  }
  throw unknown();
}
function utf8Bytes_(value) {
  const b = [];
  for (let i = 0; i < value.length; i++) {
    let c = value.charCodeAt(i);
    if (c <= 127) {
      b.push(c);
    } else {
      if (c <= 2047) {
        b.push(192 | c >> 6, 128 | c & 63);
      } else {
        if ((c & 64512) === 55296) {
          const valid = i < value.length - 1 && (value.charCodeAt(i + 1) & 64512) === 56320;
          if (!valid) {
            b.push(239, 191, 189);
          } else {
            const hi = c;
            const lo = value.charCodeAt(++i);
            c = 65536 | (hi & 1023) << 10 | lo & 1023;
            b.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
          }
        } else {
          if ((c & 64512) === 56320) {
            b.push(239, 191, 189);
          } else {
            b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
          }
        }
      }
    }
  }
  return new Uint8Array(b);
}
function percentEncodedBytes_(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch (e) {
    throw invalidFormat(StringFormat.DATA_URL, "Malformed data URL.");
  }
  return utf8Bytes_(decoded);
}
function base64Bytes_(format, value) {
  switch (format) {
    case StringFormat.BASE64: {
      const hasMinus = value.indexOf("-") !== -1;
      const hasUnder = value.indexOf("_") !== -1;
      if (hasMinus || hasUnder) {
        const invalidChar = hasMinus ? "-" : "_";
        throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64url encoded?");
      }
      break;
    }
    case StringFormat.BASE64URL: {
      const hasPlus = value.indexOf("+") !== -1;
      const hasSlash = value.indexOf("/") !== -1;
      if (hasPlus || hasSlash) {
        const invalidChar = hasPlus ? "+" : "/";
        throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64 encoded?");
      }
      value = value.replace(/-/g, "+").replace(/_/g, "/");
      break;
    }
  }
  let bytes;
  try {
    bytes = decodeBase64(value);
  } catch (e) {
    if (e.message.includes("polyfill")) {
      throw e;
    }
    throw invalidFormat(format, "Invalid character found");
  }
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  return array;
}
var DataURLParts = class {
  constructor(dataURL) {
    this.base64 = false;
    this.contentType = null;
    const matches = dataURL.match(/^data:([^,]+)?,/);
    if (matches === null) {
      throw invalidFormat(StringFormat.DATA_URL, "Must be formatted 'data:[<mediatype>][;base64],<data>");
    }
    const middle = matches[1] || null;
    if (middle != null) {
      this.base64 = endsWith(middle, ";base64");
      this.contentType = this.base64 ? middle.substring(0, middle.length - ";base64".length) : middle;
    }
    this.rest = dataURL.substring(dataURL.indexOf(",") + 1);
  }
};
function dataURLBytes_(dataUrl) {
  const parts = new DataURLParts(dataUrl);
  if (parts.base64) {
    return base64Bytes_(StringFormat.BASE64, parts.rest);
  } else {
    return percentEncodedBytes_(parts.rest);
  }
}
function dataURLContentType_(dataUrl) {
  const parts = new DataURLParts(dataUrl);
  return parts.contentType;
}
function endsWith(s, end) {
  const longEnough = s.length >= end.length;
  if (!longEnough) {
    return false;
  }
  return s.substring(s.length - end.length) === end;
}
var FbsBlob = class _FbsBlob {
  constructor(data, elideCopy) {
    let size = 0;
    let blobType = "";
    if (isNativeBlob(data)) {
      this.data_ = data;
      size = data.size;
      blobType = data.type;
    } else if (data instanceof ArrayBuffer) {
      if (elideCopy) {
        this.data_ = new Uint8Array(data);
      } else {
        this.data_ = new Uint8Array(data.byteLength);
        this.data_.set(new Uint8Array(data));
      }
      size = this.data_.length;
    } else if (data instanceof Uint8Array) {
      if (elideCopy) {
        this.data_ = data;
      } else {
        this.data_ = new Uint8Array(data.length);
        this.data_.set(data);
      }
      size = data.length;
    }
    this.size_ = size;
    this.type_ = blobType;
  }
  size() {
    return this.size_;
  }
  type() {
    return this.type_;
  }
  slice(startByte, endByte) {
    if (isNativeBlob(this.data_)) {
      const realBlob = this.data_;
      const sliced = sliceBlob(realBlob, startByte, endByte);
      if (sliced === null) {
        return null;
      }
      return new _FbsBlob(sliced);
    } else {
      const slice = new Uint8Array(this.data_.buffer, startByte, endByte - startByte);
      return new _FbsBlob(slice, true);
    }
  }
  static getBlob(...args) {
    if (isNativeBlobDefined()) {
      const blobby = args.map((val) => {
        if (val instanceof _FbsBlob) {
          return val.data_;
        } else {
          return val;
        }
      });
      return new _FbsBlob(getBlob$1.apply(null, blobby));
    } else {
      const uint8Arrays = args.map((val) => {
        if (isString(val)) {
          return dataFromString(StringFormat.RAW, val).data;
        } else {
          return val.data_;
        }
      });
      let finalLength = 0;
      uint8Arrays.forEach((array) => {
        finalLength += array.byteLength;
      });
      const merged = new Uint8Array(finalLength);
      let index = 0;
      uint8Arrays.forEach((array) => {
        for (let i = 0; i < array.length; i++) {
          merged[index++] = array[i];
        }
      });
      return new _FbsBlob(merged, true);
    }
  }
  uploadData() {
    return this.data_;
  }
};
function jsonObjectOrNull(s) {
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (e) {
    return null;
  }
  if (isNonArrayObject(obj)) {
    return obj;
  } else {
    return null;
  }
}
function parent(path) {
  if (path.length === 0) {
    return null;
  }
  const index = path.lastIndexOf("/");
  if (index === -1) {
    return "";
  }
  const newPath = path.slice(0, index);
  return newPath;
}
function child(path, childPath) {
  const canonicalChildPath = childPath.split("/").filter((component) => component.length > 0).join("/");
  if (path.length === 0) {
    return canonicalChildPath;
  } else {
    return path + "/" + canonicalChildPath;
  }
}
function lastComponent(path) {
  const index = path.lastIndexOf("/", path.length - 2);
  if (index === -1) {
    return path;
  } else {
    return path.slice(index + 1);
  }
}
function noXform_(metadata, value) {
  return value;
}
var Mapping = class {
  constructor(server, local, writable, xform) {
    this.server = server;
    this.local = local || server;
    this.writable = !!writable;
    this.xform = xform || noXform_;
  }
};
var mappings_ = null;
function xformPath(fullPath) {
  if (!isString(fullPath) || fullPath.length < 2) {
    return fullPath;
  } else {
    return lastComponent(fullPath);
  }
}
function getMappings() {
  if (mappings_) {
    return mappings_;
  }
  const mappings = [];
  mappings.push(new Mapping("bucket"));
  mappings.push(new Mapping("generation"));
  mappings.push(new Mapping("metageneration"));
  mappings.push(new Mapping("name", "fullPath", true));
  function mappingsXformPath(_metadata, fullPath) {
    return xformPath(fullPath);
  }
  const nameMapping = new Mapping("name");
  nameMapping.xform = mappingsXformPath;
  mappings.push(nameMapping);
  function xformSize(_metadata, size) {
    if (size !== void 0) {
      return Number(size);
    } else {
      return size;
    }
  }
  const sizeMapping = new Mapping("size");
  sizeMapping.xform = xformSize;
  mappings.push(sizeMapping);
  mappings.push(new Mapping("timeCreated"));
  mappings.push(new Mapping("updated"));
  mappings.push(new Mapping("md5Hash", null, true));
  mappings.push(new Mapping("cacheControl", null, true));
  mappings.push(new Mapping("contentDisposition", null, true));
  mappings.push(new Mapping("contentEncoding", null, true));
  mappings.push(new Mapping("contentLanguage", null, true));
  mappings.push(new Mapping("contentType", null, true));
  mappings.push(new Mapping("metadata", "customMetadata", true));
  mappings_ = mappings;
  return mappings_;
}
function addRef(metadata, service) {
  function generateRef() {
    const bucket = metadata["bucket"];
    const path = metadata["fullPath"];
    const loc = new Location(bucket, path);
    return service._makeStorageReference(loc);
  }
  Object.defineProperty(metadata, "ref", {
    get: generateRef
  });
}
function fromResource(service, resource, mappings) {
  const metadata = {};
  metadata["type"] = "file";
  const len = mappings.length;
  for (let i = 0; i < len; i++) {
    const mapping = mappings[i];
    metadata[mapping.local] = mapping.xform(metadata, resource[mapping.server]);
  }
  addRef(metadata, service);
  return metadata;
}
function fromResourceString(service, resourceString, mappings) {
  const obj = jsonObjectOrNull(resourceString);
  if (obj === null) {
    return null;
  }
  const resource = obj;
  return fromResource(service, resource, mappings);
}
function downloadUrlFromResourceString(metadata, resourceString, host, protocol) {
  const obj = jsonObjectOrNull(resourceString);
  if (obj === null) {
    return null;
  }
  if (!isString(obj["downloadTokens"])) {
    return null;
  }
  const tokens = obj["downloadTokens"];
  if (tokens.length === 0) {
    return null;
  }
  const encode = encodeURIComponent;
  const tokensList = tokens.split(",");
  const urls = tokensList.map((token) => {
    const bucket = metadata["bucket"];
    const path = metadata["fullPath"];
    const urlPart = "/b/" + encode(bucket) + "/o/" + encode(path);
    const base = makeUrl(urlPart, host, protocol);
    const queryString = makeQueryString({
      alt: "media",
      token
    });
    return base + queryString;
  });
  return urls[0];
}
function toResourceString(metadata, mappings) {
  const resource = {};
  const len = mappings.length;
  for (let i = 0; i < len; i++) {
    const mapping = mappings[i];
    if (mapping.writable) {
      resource[mapping.server] = metadata[mapping.local];
    }
  }
  return JSON.stringify(resource);
}
var PREFIXES_KEY = "prefixes";
var ITEMS_KEY = "items";
function fromBackendResponse(service, bucket, resource) {
  const listResult = {
    prefixes: [],
    items: [],
    nextPageToken: resource["nextPageToken"]
  };
  if (resource[PREFIXES_KEY]) {
    for (const path of resource[PREFIXES_KEY]) {
      const pathWithoutTrailingSlash = path.replace(/\/$/, "");
      const reference = service._makeStorageReference(new Location(bucket, pathWithoutTrailingSlash));
      listResult.prefixes.push(reference);
    }
  }
  if (resource[ITEMS_KEY]) {
    for (const item of resource[ITEMS_KEY]) {
      const reference = service._makeStorageReference(new Location(bucket, item["name"]));
      listResult.items.push(reference);
    }
  }
  return listResult;
}
function fromResponseString(service, bucket, resourceString) {
  const obj = jsonObjectOrNull(resourceString);
  if (obj === null) {
    return null;
  }
  const resource = obj;
  return fromBackendResponse(service, bucket, resource);
}
var RequestInfo = class {
  constructor(url, method, handler, timeout) {
    this.url = url;
    this.method = method;
    this.handler = handler;
    this.timeout = timeout;
    this.urlParams = {};
    this.headers = {};
    this.body = null;
    this.errorHandler = null;
    this.progressCallback = null;
    this.successCodes = [200];
    this.additionalRetryCodes = [];
  }
};
function handlerCheck(cndn) {
  if (!cndn) {
    throw unknown();
  }
}
function metadataHandler(service, mappings) {
  function handler(xhr, text) {
    const metadata = fromResourceString(service, text, mappings);
    handlerCheck(metadata !== null);
    return metadata;
  }
  return handler;
}
function listHandler(service, bucket) {
  function handler(xhr, text) {
    const listResult = fromResponseString(service, bucket, text);
    handlerCheck(listResult !== null);
    return listResult;
  }
  return handler;
}
function downloadUrlHandler(service, mappings) {
  function handler(xhr, text) {
    const metadata = fromResourceString(service, text, mappings);
    handlerCheck(metadata !== null);
    return downloadUrlFromResourceString(metadata, text, service.host, service._protocol);
  }
  return handler;
}
function sharedErrorHandler(location) {
  function errorHandler(xhr, err) {
    let newErr;
    if (xhr.getStatus() === 401) {
      if (
        // This exact message string is the only consistent part of the
        // server's error response that identifies it as an App Check error.
        xhr.getErrorText().includes("Firebase App Check token is invalid")
      ) {
        newErr = unauthorizedApp();
      } else {
        newErr = unauthenticated();
      }
    } else {
      if (xhr.getStatus() === 402) {
        newErr = quotaExceeded(location.bucket);
      } else {
        if (xhr.getStatus() === 403) {
          newErr = unauthorized(location.path);
        } else {
          newErr = err;
        }
      }
    }
    newErr.status = xhr.getStatus();
    newErr.serverResponse = err.serverResponse;
    return newErr;
  }
  return errorHandler;
}
function objectErrorHandler(location) {
  const shared = sharedErrorHandler(location);
  function errorHandler(xhr, err) {
    let newErr = shared(xhr, err);
    if (xhr.getStatus() === 404) {
      newErr = objectNotFound(location.path);
    }
    newErr.serverResponse = err.serverResponse;
    return newErr;
  }
  return errorHandler;
}
function getMetadata$2(service, location, mappings) {
  const urlPart = location.fullServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "GET";
  const timeout = service.maxOperationRetryTime;
  const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
  requestInfo.errorHandler = objectErrorHandler(location);
  return requestInfo;
}
function list$2(service, location, delimiter, pageToken, maxResults) {
  const urlParams = {};
  if (location.isRoot) {
    urlParams["prefix"] = "";
  } else {
    urlParams["prefix"] = location.path + "/";
  }
  if (delimiter && delimiter.length > 0) {
    urlParams["delimiter"] = delimiter;
  }
  if (pageToken) {
    urlParams["pageToken"] = pageToken;
  }
  if (maxResults) {
    urlParams["maxResults"] = maxResults;
  }
  const urlPart = location.bucketOnlyServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "GET";
  const timeout = service.maxOperationRetryTime;
  const requestInfo = new RequestInfo(url, method, listHandler(service, location.bucket), timeout);
  requestInfo.urlParams = urlParams;
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
function getDownloadUrl(service, location, mappings) {
  const urlPart = location.fullServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "GET";
  const timeout = service.maxOperationRetryTime;
  const requestInfo = new RequestInfo(url, method, downloadUrlHandler(service, mappings), timeout);
  requestInfo.errorHandler = objectErrorHandler(location);
  return requestInfo;
}
function updateMetadata$2(service, location, metadata, mappings) {
  const urlPart = location.fullServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "PATCH";
  const body = toResourceString(metadata, mappings);
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };
  const timeout = service.maxOperationRetryTime;
  const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
  requestInfo.headers = headers;
  requestInfo.body = body;
  requestInfo.errorHandler = objectErrorHandler(location);
  return requestInfo;
}
function deleteObject$2(service, location) {
  const urlPart = location.fullServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "DELETE";
  const timeout = service.maxOperationRetryTime;
  function handler(_xhr, _text) {
  }
  const requestInfo = new RequestInfo(url, method, handler, timeout);
  requestInfo.successCodes = [200, 204];
  requestInfo.errorHandler = objectErrorHandler(location);
  return requestInfo;
}
function determineContentType_(metadata, blob) {
  return metadata && metadata["contentType"] || blob && blob.type() || "application/octet-stream";
}
function metadataForUpload_(location, blob, metadata) {
  const metadataClone = Object.assign({}, metadata);
  metadataClone["fullPath"] = location.path;
  metadataClone["size"] = blob.size();
  if (!metadataClone["contentType"]) {
    metadataClone["contentType"] = determineContentType_(null, blob);
  }
  return metadataClone;
}
function multipartUpload(service, location, mappings, blob, metadata) {
  const urlPart = location.bucketOnlyServerUrl();
  const headers = {
    "X-Goog-Upload-Protocol": "multipart"
  };
  function genBoundary() {
    let str = "";
    for (let i = 0; i < 2; i++) {
      str = str + Math.random().toString().slice(2);
    }
    return str;
  }
  const boundary = genBoundary();
  headers["Content-Type"] = "multipart/related; boundary=" + boundary;
  const metadata_ = metadataForUpload_(location, blob, metadata);
  const metadataString = toResourceString(metadata_, mappings);
  const preBlobPart = "--" + boundary + "\r\nContent-Type: application/json; charset=utf-8\r\n\r\n" + metadataString + "\r\n--" + boundary + "\r\nContent-Type: " + metadata_["contentType"] + "\r\n\r\n";
  const postBlobPart = "\r\n--" + boundary + "--";
  const body = FbsBlob.getBlob(preBlobPart, blob, postBlobPart);
  if (body === null) {
    throw cannotSliceBlob();
  }
  const urlParams = {
    name: metadata_["fullPath"]
  };
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "POST";
  const timeout = service.maxUploadRetryTime;
  const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
  requestInfo.urlParams = urlParams;
  requestInfo.headers = headers;
  requestInfo.body = body.uploadData();
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
var ResumableUploadStatus = class {
  constructor(current, total, finalized, metadata) {
    this.current = current;
    this.total = total;
    this.finalized = !!finalized;
    this.metadata = metadata || null;
  }
};
function checkResumeHeader_(xhr, allowed) {
  let status = null;
  try {
    status = xhr.getResponseHeader("X-Goog-Upload-Status");
  } catch (e) {
    handlerCheck(false);
  }
  const allowedStatus = allowed || ["active"];
  handlerCheck(!!status && allowedStatus.indexOf(status) !== -1);
  return status;
}
function createResumableUpload(service, location, mappings, blob, metadata) {
  const urlPart = location.bucketOnlyServerUrl();
  const metadataForUpload = metadataForUpload_(location, blob, metadata);
  const urlParams = {
    name: metadataForUpload["fullPath"]
  };
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "POST";
  const headers = {
    "X-Goog-Upload-Protocol": "resumable",
    "X-Goog-Upload-Command": "start",
    "X-Goog-Upload-Header-Content-Length": `${blob.size()}`,
    "X-Goog-Upload-Header-Content-Type": metadataForUpload["contentType"],
    "Content-Type": "application/json; charset=utf-8"
  };
  const body = toResourceString(metadataForUpload, mappings);
  const timeout = service.maxUploadRetryTime;
  function handler(xhr) {
    checkResumeHeader_(xhr);
    let url2;
    try {
      url2 = xhr.getResponseHeader("X-Goog-Upload-URL");
    } catch (e) {
      handlerCheck(false);
    }
    handlerCheck(isString(url2));
    return url2;
  }
  const requestInfo = new RequestInfo(url, method, handler, timeout);
  requestInfo.urlParams = urlParams;
  requestInfo.headers = headers;
  requestInfo.body = body;
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
function getResumableUploadStatus(service, location, url, blob) {
  const headers = {
    "X-Goog-Upload-Command": "query"
  };
  function handler(xhr) {
    const status = checkResumeHeader_(xhr, ["active", "final"]);
    let sizeString = null;
    try {
      sizeString = xhr.getResponseHeader("X-Goog-Upload-Size-Received");
    } catch (e) {
      handlerCheck(false);
    }
    if (!sizeString) {
      handlerCheck(false);
    }
    const size = Number(sizeString);
    handlerCheck(!isNaN(size));
    return new ResumableUploadStatus(size, blob.size(), status === "final");
  }
  const method = "POST";
  const timeout = service.maxUploadRetryTime;
  const requestInfo = new RequestInfo(url, method, handler, timeout);
  requestInfo.headers = headers;
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
var RESUMABLE_UPLOAD_CHUNK_SIZE = 256 * 1024;
function continueResumableUpload(location, service, url, blob, chunkSize, mappings, status, progressCallback) {
  const status_ = new ResumableUploadStatus(0, 0);
  if (status) {
    status_.current = status.current;
    status_.total = status.total;
  } else {
    status_.current = 0;
    status_.total = blob.size();
  }
  if (blob.size() !== status_.total) {
    throw serverFileWrongSize();
  }
  const bytesLeft = status_.total - status_.current;
  let bytesToUpload = bytesLeft;
  if (chunkSize > 0) {
    bytesToUpload = Math.min(bytesToUpload, chunkSize);
  }
  const startByte = status_.current;
  const endByte = startByte + bytesToUpload;
  let uploadCommand = "";
  if (bytesToUpload === 0) {
    uploadCommand = "finalize";
  } else if (bytesLeft === bytesToUpload) {
    uploadCommand = "upload, finalize";
  } else {
    uploadCommand = "upload";
  }
  const headers = {
    "X-Goog-Upload-Command": uploadCommand,
    "X-Goog-Upload-Offset": `${status_.current}`
  };
  const body = blob.slice(startByte, endByte);
  if (body === null) {
    throw cannotSliceBlob();
  }
  function handler(xhr, text) {
    const uploadStatus = checkResumeHeader_(xhr, ["active", "final"]);
    const newCurrent = status_.current + bytesToUpload;
    const size = blob.size();
    let metadata;
    if (uploadStatus === "final") {
      metadata = metadataHandler(service, mappings)(xhr, text);
    } else {
      metadata = null;
    }
    return new ResumableUploadStatus(newCurrent, size, uploadStatus === "final", metadata);
  }
  const method = "POST";
  const timeout = service.maxUploadRetryTime;
  const requestInfo = new RequestInfo(url, method, handler, timeout);
  requestInfo.headers = headers;
  requestInfo.body = body.uploadData();
  requestInfo.progressCallback = progressCallback || null;
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
var TaskEvent = {
  /**
   * For this event,
   * <ul>
   *   <li>The `next` function is triggered on progress updates and when the
   *       task is paused/resumed with an `UploadTaskSnapshot` as the first
   *       argument.</li>
   *   <li>The `error` function is triggered if the upload is canceled or fails
   *       for another reason.</li>
   *   <li>The `complete` function is triggered if the upload completes
   *       successfully.</li>
   * </ul>
   */
  STATE_CHANGED: "state_changed"
};
var TaskState = {
  /** The task is currently transferring data. */
  RUNNING: "running",
  /** The task was paused by the user. */
  PAUSED: "paused",
  /** The task completed successfully. */
  SUCCESS: "success",
  /** The task was canceled. */
  CANCELED: "canceled",
  /** The task failed with an error. */
  ERROR: "error"
};
function taskStateFromInternalTaskState(state) {
  switch (state) {
    case "running":
    case "pausing":
    case "canceling":
      return TaskState.RUNNING;
    case "paused":
      return TaskState.PAUSED;
    case "success":
      return TaskState.SUCCESS;
    case "canceled":
      return TaskState.CANCELED;
    case "error":
      return TaskState.ERROR;
    default:
      return TaskState.ERROR;
  }
}
var Observer = class {
  constructor(nextOrObserver, error, complete) {
    const asFunctions = isFunction(nextOrObserver) || error != null || complete != null;
    if (asFunctions) {
      this.next = nextOrObserver;
      this.error = error !== null && error !== void 0 ? error : void 0;
      this.complete = complete !== null && complete !== void 0 ? complete : void 0;
    } else {
      const observer = nextOrObserver;
      this.next = observer.next;
      this.error = observer.error;
      this.complete = observer.complete;
    }
  }
};
function async(f) {
  return (...argsToForward) => {
    Promise.resolve().then(() => f(...argsToForward));
  };
}
var textFactoryOverride = null;
var XhrConnection = class {
  constructor() {
    this.sent_ = false;
    this.xhr_ = new XMLHttpRequest();
    this.initXhr();
    this.errorCode_ = ErrorCode.NO_ERROR;
    this.sendPromise_ = new Promise((resolve) => {
      this.xhr_.addEventListener("abort", () => {
        this.errorCode_ = ErrorCode.ABORT;
        resolve();
      });
      this.xhr_.addEventListener("error", () => {
        this.errorCode_ = ErrorCode.NETWORK_ERROR;
        resolve();
      });
      this.xhr_.addEventListener("load", () => {
        resolve();
      });
    });
  }
  send(url, method, body, headers) {
    if (this.sent_) {
      throw internalError("cannot .send() more than once");
    }
    this.sent_ = true;
    this.xhr_.open(method, url, true);
    if (headers !== void 0) {
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          this.xhr_.setRequestHeader(key, headers[key].toString());
        }
      }
    }
    if (body !== void 0) {
      this.xhr_.send(body);
    } else {
      this.xhr_.send();
    }
    return this.sendPromise_;
  }
  getErrorCode() {
    if (!this.sent_) {
      throw internalError("cannot .getErrorCode() before sending");
    }
    return this.errorCode_;
  }
  getStatus() {
    if (!this.sent_) {
      throw internalError("cannot .getStatus() before sending");
    }
    try {
      return this.xhr_.status;
    } catch (e) {
      return -1;
    }
  }
  getResponse() {
    if (!this.sent_) {
      throw internalError("cannot .getResponse() before sending");
    }
    return this.xhr_.response;
  }
  getErrorText() {
    if (!this.sent_) {
      throw internalError("cannot .getErrorText() before sending");
    }
    return this.xhr_.statusText;
  }
  /** Aborts the request. */
  abort() {
    this.xhr_.abort();
  }
  getResponseHeader(header) {
    return this.xhr_.getResponseHeader(header);
  }
  addUploadProgressListener(listener) {
    if (this.xhr_.upload != null) {
      this.xhr_.upload.addEventListener("progress", listener);
    }
  }
  removeUploadProgressListener(listener) {
    if (this.xhr_.upload != null) {
      this.xhr_.upload.removeEventListener("progress", listener);
    }
  }
};
var XhrTextConnection = class extends XhrConnection {
  initXhr() {
    this.xhr_.responseType = "text";
  }
};
function newTextConnection() {
  return textFactoryOverride ? textFactoryOverride() : new XhrTextConnection();
}
var UploadTask = class {
  /**
   * @param ref - The firebaseStorage.Reference object this task came
   *     from, untyped to avoid cyclic dependencies.
   * @param blob - The blob to upload.
   */
  constructor(ref2, blob, metadata = null) {
    this._transferred = 0;
    this._needToFetchStatus = false;
    this._needToFetchMetadata = false;
    this._observers = [];
    this._error = void 0;
    this._uploadUrl = void 0;
    this._request = void 0;
    this._chunkMultiplier = 1;
    this._resolve = void 0;
    this._reject = void 0;
    this._ref = ref2;
    this._blob = blob;
    this._metadata = metadata;
    this._mappings = getMappings();
    this._resumable = this._shouldDoResumable(this._blob);
    this._state = "running";
    this._errorHandler = (error) => {
      this._request = void 0;
      this._chunkMultiplier = 1;
      if (error._codeEquals(StorageErrorCode.CANCELED)) {
        this._needToFetchStatus = true;
        this.completeTransitions_();
      } else {
        const backoffExpired = this.isExponentialBackoffExpired();
        if (isRetryStatusCode(error.status, [])) {
          if (backoffExpired) {
            error = retryLimitExceeded();
          } else {
            this.sleepTime = Math.max(this.sleepTime * 2, DEFAULT_MIN_SLEEP_TIME_MILLIS);
            this._needToFetchStatus = true;
            this.completeTransitions_();
            return;
          }
        }
        this._error = error;
        this._transition(
          "error"
          /* InternalTaskState.ERROR */
        );
      }
    };
    this._metadataErrorHandler = (error) => {
      this._request = void 0;
      if (error._codeEquals(StorageErrorCode.CANCELED)) {
        this.completeTransitions_();
      } else {
        this._error = error;
        this._transition(
          "error"
          /* InternalTaskState.ERROR */
        );
      }
    };
    this.sleepTime = 0;
    this.maxSleepTime = this._ref.storage.maxUploadRetryTime;
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._start();
    });
    this._promise.then(null, () => {
    });
  }
  isExponentialBackoffExpired() {
    return this.sleepTime > this.maxSleepTime;
  }
  _makeProgressCallback() {
    const sizeBefore = this._transferred;
    return (loaded) => this._updateProgress(sizeBefore + loaded);
  }
  _shouldDoResumable(blob) {
    return blob.size() > 256 * 1024;
  }
  _start() {
    if (this._state !== "running") {
      return;
    }
    if (this._request !== void 0) {
      return;
    }
    if (this._resumable) {
      if (this._uploadUrl === void 0) {
        this._createResumable();
      } else {
        if (this._needToFetchStatus) {
          this._fetchStatus();
        } else {
          if (this._needToFetchMetadata) {
            this._fetchMetadata();
          } else {
            this.pendingTimeout = setTimeout(() => {
              this.pendingTimeout = void 0;
              this._continueUpload();
            }, this.sleepTime);
          }
        }
      }
    } else {
      this._oneShotUpload();
    }
  }
  _resolveToken(callback) {
    Promise.all([this._ref.storage._getAuthToken(), this._ref.storage._getAppCheckToken()]).then(([authToken, appCheckToken]) => {
      switch (this._state) {
        case "running":
          callback(authToken, appCheckToken);
          break;
        case "canceling":
          this._transition(
            "canceled"
            /* InternalTaskState.CANCELED */
          );
          break;
        case "pausing":
          this._transition(
            "paused"
            /* InternalTaskState.PAUSED */
          );
          break;
      }
    });
  }
  // TODO(andysoto): assert false
  _createResumable() {
    this._resolveToken((authToken, appCheckToken) => {
      const requestInfo = createResumableUpload(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata);
      const createRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
      this._request = createRequest;
      createRequest.getPromise().then((url) => {
        this._request = void 0;
        this._uploadUrl = url;
        this._needToFetchStatus = false;
        this.completeTransitions_();
      }, this._errorHandler);
    });
  }
  _fetchStatus() {
    const url = this._uploadUrl;
    this._resolveToken((authToken, appCheckToken) => {
      const requestInfo = getResumableUploadStatus(this._ref.storage, this._ref._location, url, this._blob);
      const statusRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
      this._request = statusRequest;
      statusRequest.getPromise().then((status) => {
        status = status;
        this._request = void 0;
        this._updateProgress(status.current);
        this._needToFetchStatus = false;
        if (status.finalized) {
          this._needToFetchMetadata = true;
        }
        this.completeTransitions_();
      }, this._errorHandler);
    });
  }
  _continueUpload() {
    const chunkSize = RESUMABLE_UPLOAD_CHUNK_SIZE * this._chunkMultiplier;
    const status = new ResumableUploadStatus(this._transferred, this._blob.size());
    const url = this._uploadUrl;
    this._resolveToken((authToken, appCheckToken) => {
      let requestInfo;
      try {
        requestInfo = continueResumableUpload(this._ref._location, this._ref.storage, url, this._blob, chunkSize, this._mappings, status, this._makeProgressCallback());
      } catch (e) {
        this._error = e;
        this._transition(
          "error"
          /* InternalTaskState.ERROR */
        );
        return;
      }
      const uploadRequest = this._ref.storage._makeRequest(
        requestInfo,
        newTextConnection,
        authToken,
        appCheckToken,
        /*retry=*/
        false
        // Upload requests should not be retried as each retry should be preceded by another query request. Which is handled in this file.
      );
      this._request = uploadRequest;
      uploadRequest.getPromise().then((newStatus) => {
        this._increaseMultiplier();
        this._request = void 0;
        this._updateProgress(newStatus.current);
        if (newStatus.finalized) {
          this._metadata = newStatus.metadata;
          this._transition(
            "success"
            /* InternalTaskState.SUCCESS */
          );
        } else {
          this.completeTransitions_();
        }
      }, this._errorHandler);
    });
  }
  _increaseMultiplier() {
    const currentSize = RESUMABLE_UPLOAD_CHUNK_SIZE * this._chunkMultiplier;
    if (currentSize * 2 < 32 * 1024 * 1024) {
      this._chunkMultiplier *= 2;
    }
  }
  _fetchMetadata() {
    this._resolveToken((authToken, appCheckToken) => {
      const requestInfo = getMetadata$2(this._ref.storage, this._ref._location, this._mappings);
      const metadataRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
      this._request = metadataRequest;
      metadataRequest.getPromise().then((metadata) => {
        this._request = void 0;
        this._metadata = metadata;
        this._transition(
          "success"
          /* InternalTaskState.SUCCESS */
        );
      }, this._metadataErrorHandler);
    });
  }
  _oneShotUpload() {
    this._resolveToken((authToken, appCheckToken) => {
      const requestInfo = multipartUpload(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata);
      const multipartRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
      this._request = multipartRequest;
      multipartRequest.getPromise().then((metadata) => {
        this._request = void 0;
        this._metadata = metadata;
        this._updateProgress(this._blob.size());
        this._transition(
          "success"
          /* InternalTaskState.SUCCESS */
        );
      }, this._errorHandler);
    });
  }
  _updateProgress(transferred) {
    const old = this._transferred;
    this._transferred = transferred;
    if (this._transferred !== old) {
      this._notifyObservers();
    }
  }
  _transition(state) {
    if (this._state === state) {
      return;
    }
    switch (state) {
      case "canceling":
      case "pausing":
        this._state = state;
        if (this._request !== void 0) {
          this._request.cancel();
        } else if (this.pendingTimeout) {
          clearTimeout(this.pendingTimeout);
          this.pendingTimeout = void 0;
          this.completeTransitions_();
        }
        break;
      case "running":
        const wasPaused = this._state === "paused";
        this._state = state;
        if (wasPaused) {
          this._notifyObservers();
          this._start();
        }
        break;
      case "paused":
        this._state = state;
        this._notifyObservers();
        break;
      case "canceled":
        this._error = canceled();
        this._state = state;
        this._notifyObservers();
        break;
      case "error":
        this._state = state;
        this._notifyObservers();
        break;
      case "success":
        this._state = state;
        this._notifyObservers();
        break;
    }
  }
  completeTransitions_() {
    switch (this._state) {
      case "pausing":
        this._transition(
          "paused"
          /* InternalTaskState.PAUSED */
        );
        break;
      case "canceling":
        this._transition(
          "canceled"
          /* InternalTaskState.CANCELED */
        );
        break;
      case "running":
        this._start();
        break;
    }
  }
  /**
   * A snapshot of the current task state.
   */
  get snapshot() {
    const externalState = taskStateFromInternalTaskState(this._state);
    return {
      bytesTransferred: this._transferred,
      totalBytes: this._blob.size(),
      state: externalState,
      metadata: this._metadata,
      task: this,
      ref: this._ref
    };
  }
  /**
   * Adds a callback for an event.
   * @param type - The type of event to listen for.
   * @param nextOrObserver -
   *     The `next` function, which gets called for each item in
   *     the event stream, or an observer object with some or all of these three
   *     properties (`next`, `error`, `complete`).
   * @param error - A function that gets called with a `StorageError`
   *     if the event stream ends due to an error.
   * @param completed - A function that gets called if the
   *     event stream ends normally.
   * @returns
   *     If only the event argument is passed, returns a function you can use to
   *     add callbacks (see the examples above). If more than just the event
   *     argument is passed, returns a function you can call to unregister the
   *     callbacks.
   */
  on(type, nextOrObserver, error, completed) {
    const observer = new Observer(nextOrObserver || void 0, error || void 0, completed || void 0);
    this._addObserver(observer);
    return () => {
      this._removeObserver(observer);
    };
  }
  /**
   * This object behaves like a Promise, and resolves with its snapshot data
   * when the upload completes.
   * @param onFulfilled - The fulfillment callback. Promise chaining works as normal.
   * @param onRejected - The rejection callback.
   */
  then(onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected);
  }
  /**
   * Equivalent to calling `then(null, onRejected)`.
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  /**
   * Adds the given observer.
   */
  _addObserver(observer) {
    this._observers.push(observer);
    this._notifyObserver(observer);
  }
  /**
   * Removes the given observer.
   */
  _removeObserver(observer) {
    const i = this._observers.indexOf(observer);
    if (i !== -1) {
      this._observers.splice(i, 1);
    }
  }
  _notifyObservers() {
    this._finishPromise();
    const observers = this._observers.slice();
    observers.forEach((observer) => {
      this._notifyObserver(observer);
    });
  }
  _finishPromise() {
    if (this._resolve !== void 0) {
      let triggered = true;
      switch (taskStateFromInternalTaskState(this._state)) {
        case TaskState.SUCCESS:
          async(this._resolve.bind(null, this.snapshot))();
          break;
        case TaskState.CANCELED:
        case TaskState.ERROR:
          const toCall = this._reject;
          async(toCall.bind(null, this._error))();
          break;
        default:
          triggered = false;
          break;
      }
      if (triggered) {
        this._resolve = void 0;
        this._reject = void 0;
      }
    }
  }
  _notifyObserver(observer) {
    const externalState = taskStateFromInternalTaskState(this._state);
    switch (externalState) {
      case TaskState.RUNNING:
      case TaskState.PAUSED:
        if (observer.next) {
          async(observer.next.bind(observer, this.snapshot))();
        }
        break;
      case TaskState.SUCCESS:
        if (observer.complete) {
          async(observer.complete.bind(observer))();
        }
        break;
      case TaskState.CANCELED:
      case TaskState.ERROR:
        if (observer.error) {
          async(observer.error.bind(observer, this._error))();
        }
        break;
      default:
        if (observer.error) {
          async(observer.error.bind(observer, this._error))();
        }
    }
  }
  /**
   * Resumes a paused task. Has no effect on a currently running or failed task.
   * @returns True if the operation took effect, false if ignored.
   */
  resume() {
    const valid = this._state === "paused" || this._state === "pausing";
    if (valid) {
      this._transition(
        "running"
        /* InternalTaskState.RUNNING */
      );
    }
    return valid;
  }
  /**
   * Pauses a currently running task. Has no effect on a paused or failed task.
   * @returns True if the operation took effect, false if ignored.
   */
  pause() {
    const valid = this._state === "running";
    if (valid) {
      this._transition(
        "pausing"
        /* InternalTaskState.PAUSING */
      );
    }
    return valid;
  }
  /**
   * Cancels a currently running or paused task. Has no effect on a complete or
   * failed task.
   * @returns True if the operation took effect, false if ignored.
   */
  cancel() {
    const valid = this._state === "running" || this._state === "pausing";
    if (valid) {
      this._transition(
        "canceling"
        /* InternalTaskState.CANCELING */
      );
    }
    return valid;
  }
};
var Reference = class _Reference {
  constructor(_service, location) {
    this._service = _service;
    if (location instanceof Location) {
      this._location = location;
    } else {
      this._location = Location.makeFromUrl(location, _service.host);
    }
  }
  /**
   * Returns the URL for the bucket and path this object references,
   *     in the form gs://<bucket>/<object-path>
   * @override
   */
  toString() {
    return "gs://" + this._location.bucket + "/" + this._location.path;
  }
  _newRef(service, location) {
    return new _Reference(service, location);
  }
  /**
   * A reference to the root of this object's bucket.
   */
  get root() {
    const location = new Location(this._location.bucket, "");
    return this._newRef(this._service, location);
  }
  /**
   * The name of the bucket containing this reference's object.
   */
  get bucket() {
    return this._location.bucket;
  }
  /**
   * The full path of this object.
   */
  get fullPath() {
    return this._location.path;
  }
  /**
   * The short name of this object, which is the last component of the full path.
   * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
   */
  get name() {
    return lastComponent(this._location.path);
  }
  /**
   * The `StorageService` instance this `StorageReference` is associated with.
   */
  get storage() {
    return this._service;
  }
  /**
   * A `StorageReference` pointing to the parent location of this `StorageReference`, or null if
   * this reference is the root.
   */
  get parent() {
    const newPath = parent(this._location.path);
    if (newPath === null) {
      return null;
    }
    const location = new Location(this._location.bucket, newPath);
    return new _Reference(this._service, location);
  }
  /**
   * Utility function to throw an error in methods that do not accept a root reference.
   */
  _throwIfRoot(name4) {
    if (this._location.path === "") {
      throw invalidRootOperation(name4);
    }
  }
};
function uploadBytesResumable$1(ref2, data, metadata) {
  ref2._throwIfRoot("uploadBytesResumable");
  return new UploadTask(ref2, new FbsBlob(data), metadata);
}
function listAll$1(ref2) {
  const accumulator = {
    prefixes: [],
    items: []
  };
  return listAllHelper(ref2, accumulator).then(() => accumulator);
}
function listAllHelper(ref2, accumulator, pageToken) {
  return __async(this, null, function* () {
    const opt = {
      // maxResults is 1000 by default.
      pageToken
    };
    const nextPage = yield list$1(ref2, opt);
    accumulator.prefixes.push(...nextPage.prefixes);
    accumulator.items.push(...nextPage.items);
    if (nextPage.nextPageToken != null) {
      yield listAllHelper(ref2, accumulator, nextPage.nextPageToken);
    }
  });
}
function list$1(ref2, options) {
  if (options != null) {
    if (typeof options.maxResults === "number") {
      validateNumber(
        "options.maxResults",
        /* minValue= */
        1,
        /* maxValue= */
        1e3,
        options.maxResults
      );
    }
  }
  const op = options || {};
  const requestInfo = list$2(
    ref2.storage,
    ref2._location,
    /*delimiter= */
    "/",
    op.pageToken,
    op.maxResults
  );
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
function getMetadata$1(ref2) {
  ref2._throwIfRoot("getMetadata");
  const requestInfo = getMetadata$2(ref2.storage, ref2._location, getMappings());
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
function updateMetadata$1(ref2, metadata) {
  ref2._throwIfRoot("updateMetadata");
  const requestInfo = updateMetadata$2(ref2.storage, ref2._location, metadata, getMappings());
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
function getDownloadURL$1(ref2) {
  ref2._throwIfRoot("getDownloadURL");
  const requestInfo = getDownloadUrl(ref2.storage, ref2._location, getMappings());
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection).then((url) => {
    if (url === null) {
      throw noDownloadURL();
    }
    return url;
  });
}
function deleteObject$1(ref2) {
  ref2._throwIfRoot("deleteObject");
  const requestInfo = deleteObject$2(ref2.storage, ref2._location);
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
function _getChild$1(ref2, childPath) {
  const newPath = child(ref2._location.path, childPath);
  const location = new Location(ref2._location.bucket, newPath);
  return new Reference(ref2.storage, location);
}
function isUrl(path) {
  return /^[A-Za-z]+:\/\//.test(path);
}
function refFromURL(service, url) {
  return new Reference(service, url);
}
function refFromPath(ref2, path) {
  if (ref2 instanceof FirebaseStorageImpl) {
    const service = ref2;
    if (service._bucket == null) {
      throw noDefaultBucket();
    }
    const reference = new Reference(service, service._bucket);
    if (path != null) {
      return refFromPath(reference, path);
    } else {
      return reference;
    }
  } else {
    if (path !== void 0) {
      return _getChild$1(ref2, path);
    } else {
      return ref2;
    }
  }
}
function ref$1(serviceOrRef, pathOrUrl) {
  if (pathOrUrl && isUrl(pathOrUrl)) {
    if (serviceOrRef instanceof FirebaseStorageImpl) {
      return refFromURL(serviceOrRef, pathOrUrl);
    } else {
      throw invalidArgument("To use ref(service, url), the first argument must be a Storage instance.");
    }
  } else {
    return refFromPath(serviceOrRef, pathOrUrl);
  }
}
function extractBucket(host, config) {
  const bucketString = config === null || config === void 0 ? void 0 : config[CONFIG_STORAGE_BUCKET_KEY];
  if (bucketString == null) {
    return null;
  }
  return Location.makeFromBucketSpec(bucketString, host);
}
function connectStorageEmulator$1(storage, host, port, options = {}) {
  storage.host = `${host}:${port}`;
  storage._protocol = "http";
  const {
    mockUserToken
  } = options;
  if (mockUserToken) {
    storage._overrideAuthToken = typeof mockUserToken === "string" ? mockUserToken : createMockUserToken(mockUserToken, storage.app.options.projectId);
  }
}
var FirebaseStorageImpl = class {
  constructor(app, _authProvider, _appCheckProvider, _url, _firebaseVersion) {
    this.app = app;
    this._authProvider = _authProvider;
    this._appCheckProvider = _appCheckProvider;
    this._url = _url;
    this._firebaseVersion = _firebaseVersion;
    this._bucket = null;
    this._host = DEFAULT_HOST;
    this._protocol = "https";
    this._appId = null;
    this._deleted = false;
    this._maxOperationRetryTime = DEFAULT_MAX_OPERATION_RETRY_TIME;
    this._maxUploadRetryTime = DEFAULT_MAX_UPLOAD_RETRY_TIME;
    this._requests = /* @__PURE__ */ new Set();
    if (_url != null) {
      this._bucket = Location.makeFromBucketSpec(_url, this._host);
    } else {
      this._bucket = extractBucket(this._host, this.app.options);
    }
  }
  /**
   * The host string for this service, in the form of `host` or
   * `host:port`.
   */
  get host() {
    return this._host;
  }
  set host(host) {
    this._host = host;
    if (this._url != null) {
      this._bucket = Location.makeFromBucketSpec(this._url, host);
    } else {
      this._bucket = extractBucket(host, this.app.options);
    }
  }
  /**
   * The maximum time to retry uploads in milliseconds.
   */
  get maxUploadRetryTime() {
    return this._maxUploadRetryTime;
  }
  set maxUploadRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxUploadRetryTime = time;
  }
  /**
   * The maximum time to retry operations other than uploads or downloads in
   * milliseconds.
   */
  get maxOperationRetryTime() {
    return this._maxOperationRetryTime;
  }
  set maxOperationRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxOperationRetryTime = time;
  }
  _getAuthToken() {
    return __async(this, null, function* () {
      if (this._overrideAuthToken) {
        return this._overrideAuthToken;
      }
      const auth = this._authProvider.getImmediate({
        optional: true
      });
      if (auth) {
        const tokenData = yield auth.getToken();
        if (tokenData !== null) {
          return tokenData.accessToken;
        }
      }
      return null;
    });
  }
  _getAppCheckToken() {
    return __async(this, null, function* () {
      const appCheck = this._appCheckProvider.getImmediate({
        optional: true
      });
      if (appCheck) {
        const result = yield appCheck.getToken();
        return result.token;
      }
      return null;
    });
  }
  /**
   * Stop running requests and prevent more from being created.
   */
  _delete() {
    if (!this._deleted) {
      this._deleted = true;
      this._requests.forEach((request) => request.cancel());
      this._requests.clear();
    }
    return Promise.resolve();
  }
  /**
   * Returns a new firebaseStorage.Reference object referencing this StorageService
   * at the given Location.
   */
  _makeStorageReference(loc) {
    return new Reference(this, loc);
  }
  /**
   * @param requestInfo - HTTP RequestInfo object
   * @param authToken - Firebase auth token
   */
  _makeRequest(requestInfo, requestFactory, authToken, appCheckToken, retry = true) {
    if (!this._deleted) {
      const request = makeRequest(requestInfo, this._appId, authToken, appCheckToken, requestFactory, this._firebaseVersion, retry);
      this._requests.add(request);
      request.getPromise().then(() => this._requests.delete(request), () => this._requests.delete(request));
      return request;
    } else {
      return new FailRequest(appDeleted());
    }
  }
  makeRequestWithTokens(requestInfo, requestFactory) {
    return __async(this, null, function* () {
      const [authToken, appCheckToken] = yield Promise.all([this._getAuthToken(), this._getAppCheckToken()]);
      return this._makeRequest(requestInfo, requestFactory, authToken, appCheckToken).getPromise();
    });
  }
};
var name2 = "@firebase/storage";
var version2 = "0.13.2";
var STORAGE_TYPE = "storage";
function uploadBytesResumable(ref2, data, metadata) {
  ref2 = getModularInstance(ref2);
  return uploadBytesResumable$1(ref2, data, metadata);
}
function getMetadata(ref2) {
  ref2 = getModularInstance(ref2);
  return getMetadata$1(ref2);
}
function updateMetadata(ref2, metadata) {
  ref2 = getModularInstance(ref2);
  return updateMetadata$1(ref2, metadata);
}
function list(ref2, options) {
  ref2 = getModularInstance(ref2);
  return list$1(ref2, options);
}
function listAll(ref2) {
  ref2 = getModularInstance(ref2);
  return listAll$1(ref2);
}
function getDownloadURL(ref2) {
  ref2 = getModularInstance(ref2);
  return getDownloadURL$1(ref2);
}
function deleteObject(ref2) {
  ref2 = getModularInstance(ref2);
  return deleteObject$1(ref2);
}
function ref(serviceOrRef, pathOrUrl) {
  serviceOrRef = getModularInstance(serviceOrRef);
  return ref$1(serviceOrRef, pathOrUrl);
}
function _getChild(ref2, childPath) {
  return _getChild$1(ref2, childPath);
}
function connectStorageEmulator(storage, host, port, options = {}) {
  connectStorageEmulator$1(storage, host, port, options);
}
function factory2(container, {
  instanceIdentifier: url
}) {
  const app = container.getProvider("app").getImmediate();
  const authProvider = container.getProvider("auth-internal");
  const appCheckProvider = container.getProvider("app-check-internal");
  return new FirebaseStorageImpl(app, authProvider, appCheckProvider, url, SDK_VERSION);
}
function registerStorage() {
  _registerComponent(new Component(
    STORAGE_TYPE,
    factory2,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name2, version2, "");
  registerVersion(name2, version2, "esm2017");
}
registerStorage();

// node_modules/@firebase/storage-compat/dist/esm/index.esm2017.js
var UploadTaskSnapshotCompat = class {
  constructor(_delegate, task, ref2) {
    this._delegate = _delegate;
    this.task = task;
    this.ref = ref2;
  }
  get bytesTransferred() {
    return this._delegate.bytesTransferred;
  }
  get metadata() {
    return this._delegate.metadata;
  }
  get state() {
    return this._delegate.state;
  }
  get totalBytes() {
    return this._delegate.totalBytes;
  }
};
var UploadTaskCompat = class {
  constructor(_delegate, _ref) {
    this._delegate = _delegate;
    this._ref = _ref;
    this.cancel = this._delegate.cancel.bind(this._delegate);
    this.catch = this._delegate.catch.bind(this._delegate);
    this.pause = this._delegate.pause.bind(this._delegate);
    this.resume = this._delegate.resume.bind(this._delegate);
  }
  get snapshot() {
    return new UploadTaskSnapshotCompat(this._delegate.snapshot, this, this._ref);
  }
  then(onFulfilled, onRejected) {
    return this._delegate.then((snapshot) => {
      if (onFulfilled) {
        return onFulfilled(new UploadTaskSnapshotCompat(snapshot, this, this._ref));
      }
    }, onRejected);
  }
  on(type, nextOrObserver, error, completed) {
    let wrappedNextOrObserver = void 0;
    if (!!nextOrObserver) {
      if (typeof nextOrObserver === "function") {
        wrappedNextOrObserver = (taskSnapshot) => nextOrObserver(new UploadTaskSnapshotCompat(taskSnapshot, this, this._ref));
      } else {
        wrappedNextOrObserver = {
          next: !!nextOrObserver.next ? (taskSnapshot) => nextOrObserver.next(new UploadTaskSnapshotCompat(taskSnapshot, this, this._ref)) : void 0,
          complete: nextOrObserver.complete || void 0,
          error: nextOrObserver.error || void 0
        };
      }
    }
    return this._delegate.on(type, wrappedNextOrObserver, error || void 0, completed || void 0);
  }
};
var ListResultCompat = class {
  constructor(_delegate, _service) {
    this._delegate = _delegate;
    this._service = _service;
  }
  get prefixes() {
    return this._delegate.prefixes.map((ref2) => new ReferenceCompat(ref2, this._service));
  }
  get items() {
    return this._delegate.items.map((ref2) => new ReferenceCompat(ref2, this._service));
  }
  get nextPageToken() {
    return this._delegate.nextPageToken || null;
  }
};
var ReferenceCompat = class _ReferenceCompat {
  constructor(_delegate, storage) {
    this._delegate = _delegate;
    this.storage = storage;
  }
  get name() {
    return this._delegate.name;
  }
  get bucket() {
    return this._delegate.bucket;
  }
  get fullPath() {
    return this._delegate.fullPath;
  }
  toString() {
    return this._delegate.toString();
  }
  /**
   * @returns A reference to the object obtained by
   * appending childPath, removing any duplicate, beginning, or trailing
   * slashes.
   */
  child(childPath) {
    const reference = _getChild(this._delegate, childPath);
    return new _ReferenceCompat(reference, this.storage);
  }
  get root() {
    return new _ReferenceCompat(this._delegate.root, this.storage);
  }
  /**
   * @returns A reference to the parent of the
   * current object, or null if the current object is the root.
   */
  get parent() {
    const reference = this._delegate.parent;
    if (reference == null) {
      return null;
    }
    return new _ReferenceCompat(reference, this.storage);
  }
  /**
   * Uploads a blob to this object's location.
   * @param data - The blob to upload.
   * @returns An UploadTask that lets you control and
   * observe the upload.
   */
  put(data, metadata) {
    this._throwIfRoot("put");
    return new UploadTaskCompat(uploadBytesResumable(this._delegate, data, metadata), this);
  }
  /**
   * Uploads a string to this object's location.
   * @param value - The string to upload.
   * @param format - The format of the string to upload.
   * @returns An UploadTask that lets you control and
   * observe the upload.
   */
  putString(value, format = StringFormat.RAW, metadata) {
    this._throwIfRoot("putString");
    const data = dataFromString(format, value);
    const metadataClone = Object.assign({}, metadata);
    if (metadataClone["contentType"] == null && data.contentType != null) {
      metadataClone["contentType"] = data.contentType;
    }
    return new UploadTaskCompat(new UploadTask(this._delegate, new FbsBlob(data.data, true), metadataClone), this);
  }
  /**
   * List all items (files) and prefixes (folders) under this storage reference.
   *
   * This is a helper method for calling list() repeatedly until there are
   * no more results. The default pagination size is 1000.
   *
   * Note: The results may not be consistent if objects are changed while this
   * operation is running.
   *
   * Warning: listAll may potentially consume too many resources if there are
   * too many results.
   *
   * @returns A Promise that resolves with all the items and prefixes under
   *  the current storage reference. `prefixes` contains references to
   *  sub-directories and `items` contains references to objects in this
   *  folder. `nextPageToken` is never returned.
   */
  listAll() {
    return listAll(this._delegate).then((r) => new ListResultCompat(r, this.storage));
  }
  /**
   * List items (files) and prefixes (folders) under this storage reference.
   *
   * List API is only available for Firebase Rules Version 2.
   *
   * GCS is a key-blob store. Firebase Storage imposes the semantic of '/'
   * delimited folder structure. Refer to GCS's List API if you want to learn more.
   *
   * To adhere to Firebase Rules's Semantics, Firebase Storage does not
   * support objects whose paths end with "/" or contain two consecutive
   * "/"s. Firebase Storage List API will filter these unsupported objects.
   * list() may fail if there are too many unsupported objects in the bucket.
   *
   * @param options - See ListOptions for details.
   * @returns A Promise that resolves with the items and prefixes.
   * `prefixes` contains references to sub-folders and `items`
   * contains references to objects in this folder. `nextPageToken`
   * can be used to get the rest of the results.
   */
  list(options) {
    return list(this._delegate, options || void 0).then((r) => new ListResultCompat(r, this.storage));
  }
  /**
   * A `Promise` that resolves with the metadata for this object. If this
   * object doesn't exist or metadata cannot be retrieved, the promise is
   * rejected.
   */
  getMetadata() {
    return getMetadata(this._delegate);
  }
  /**
   * Updates the metadata for this object.
   * @param metadata - The new metadata for the object.
   * Only values that have been explicitly set will be changed. Explicitly
   * setting a value to null will remove the metadata.
   * @returns A `Promise` that resolves
   * with the new metadata for this object.
   * @see firebaseStorage.Reference.prototype.getMetadata
   */
  updateMetadata(metadata) {
    return updateMetadata(this._delegate, metadata);
  }
  /**
   * @returns A `Promise` that resolves with the download
   * URL for this object.
   */
  getDownloadURL() {
    return getDownloadURL(this._delegate);
  }
  /**
   * Deletes the object at this location.
   * @returns A `Promise` that resolves if the deletion succeeds.
   */
  delete() {
    this._throwIfRoot("delete");
    return deleteObject(this._delegate);
  }
  _throwIfRoot(name4) {
    if (this._delegate._location.path === "") {
      throw invalidRootOperation(name4);
    }
  }
};
var StorageServiceCompat = class {
  constructor(app, _delegate) {
    this.app = app;
    this._delegate = _delegate;
  }
  get maxOperationRetryTime() {
    return this._delegate.maxOperationRetryTime;
  }
  get maxUploadRetryTime() {
    return this._delegate.maxUploadRetryTime;
  }
  /**
   * Returns a firebaseStorage.Reference for the given path in the default
   * bucket.
   */
  ref(path) {
    if (isUrl2(path)) {
      throw invalidArgument("ref() expected a child path but got a URL, use refFromURL instead.");
    }
    return new ReferenceCompat(ref(this._delegate, path), this);
  }
  /**
   * Returns a firebaseStorage.Reference object for the given absolute URL,
   * which must be a gs:// or http[s]:// URL.
   */
  refFromURL(url) {
    if (!isUrl2(url)) {
      throw invalidArgument("refFromURL() expected a full URL but got a child path, use ref() instead.");
    }
    try {
      Location.makeFromUrl(url, this._delegate.host);
    } catch (e) {
      throw invalidArgument("refFromUrl() expected a valid full URL but got an invalid one.");
    }
    return new ReferenceCompat(ref(this._delegate, url), this);
  }
  setMaxUploadRetryTime(time) {
    this._delegate.maxUploadRetryTime = time;
  }
  setMaxOperationRetryTime(time) {
    this._delegate.maxOperationRetryTime = time;
  }
  useEmulator(host, port, options = {}) {
    connectStorageEmulator(this._delegate, host, port, options);
  }
};
function isUrl2(path) {
  return /^[A-Za-z]+:\/\//.test(path);
}
var name3 = "@firebase/storage-compat";
var version3 = "0.3.12";
var STORAGE_TYPE2 = "storage-compat";
function factory3(container, {
  instanceIdentifier: url
}) {
  const app = container.getProvider("app-compat").getImmediate();
  const storageExp = container.getProvider("storage").getImmediate({
    identifier: url
  });
  const storageServiceCompat = new StorageServiceCompat(app, storageExp);
  return storageServiceCompat;
}
function registerStorage2(instance) {
  const namespaceExports = {
    // no-inline
    TaskState,
    TaskEvent,
    StringFormat,
    Storage: StorageServiceCompat,
    Reference: ReferenceCompat
  };
  instance.INTERNAL.registerComponent(new Component(
    STORAGE_TYPE2,
    factory3,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setServiceProps(namespaceExports).setMultipleInstances(true));
  instance.registerVersion(name3, version3);
}
registerStorage2(firebase);

// node_modules/@angular/fire/fesm2022/angular-fire-compat-storage.mjs
function fromTask(task) {
  return new Observable((subscriber) => {
    const progress = (snap) => subscriber.next(snap);
    const error = (e) => subscriber.error(e);
    const complete = () => subscriber.complete();
    progress(task.snapshot);
    const unsub = task.on("state_changed", progress);
    task.then((snapshot) => {
      progress(snapshot);
      complete();
    }, (e) => {
      progress(task.snapshot);
      error(e);
    });
    return function unsubscribe() {
      unsub();
    };
  }).pipe(
    // deal with sync emissions from first emitting `task.snapshot`, this makes sure
    // that if the task is already finished we don't emit the old running state
    debounceTime(0)
  );
}
function createUploadTask(task) {
  const inner$ = fromTask(task);
  return {
    task,
    then: task.then.bind(task),
    catch: task.catch.bind(task),
    pause: task.pause.bind(task),
    cancel: task.cancel.bind(task),
    resume: task.resume.bind(task),
    snapshotChanges: () => inner$,
    percentageChanges: () => inner$.pipe(map((s) => s.bytesTransferred / s.totalBytes * 100))
  };
}
function createStorageRef(ref2) {
  return {
    getDownloadURL: () => of(void 0).pipe(observeOutsideAngular, switchMap(() => ref2.getDownloadURL()), keepUnstableUntilFirst),
    getMetadata: () => of(void 0).pipe(observeOutsideAngular, switchMap(() => ref2.getMetadata()), keepUnstableUntilFirst),
    delete: () => from(ref2.delete()),
    child: (path) => createStorageRef(ref2.child(path)),
    updateMetadata: (meta) => from(ref2.updateMetadata(meta)),
    put: (data, metadata) => {
      const task = ref2.put(data, metadata);
      return createUploadTask(task);
    },
    putString: (data, format, metadata) => {
      const task = ref2.putString(data, format, metadata);
      return createUploadTask(task);
    },
    list: (options) => from(ref2.list(options)),
    listAll: () => from(ref2.listAll())
  };
}
var BUCKET = new InjectionToken("angularfire2.storageBucket");
var MAX_UPLOAD_RETRY_TIME = new InjectionToken("angularfire2.storage.maxUploadRetryTime");
var MAX_OPERATION_RETRY_TIME = new InjectionToken("angularfire2.storage.maxOperationRetryTime");
var USE_EMULATOR = new InjectionToken("angularfire2.storage.use-emulator");
var AngularFireStorage = class _AngularFireStorage {
  storage;
  constructor(options, name4, storageBucket, platformId, zone, schedulers, maxUploadRetryTime, maxOperationRetryTime, _useEmulator, _appCheckInstances) {
    const app = ɵfirebaseAppFactory(options, zone, name4);
    this.storage = ɵcacheInstance(`${app.name}.storage.${storageBucket}`, "AngularFireStorage", app.name, () => {
      const storage = zone.runOutsideAngular(() => app.storage(storageBucket || void 0));
      const useEmulator = _useEmulator;
      if (useEmulator) {
        storage.useEmulator(...useEmulator);
      }
      if (maxUploadRetryTime) {
        storage.setMaxUploadRetryTime(maxUploadRetryTime);
      }
      if (maxOperationRetryTime) {
        storage.setMaxOperationRetryTime(maxOperationRetryTime);
      }
      return storage;
    }, [maxUploadRetryTime, maxOperationRetryTime]);
  }
  ref(path) {
    return createStorageRef(this.storage.ref(path));
  }
  refFromURL(path) {
    return createStorageRef(this.storage.refFromURL(path));
  }
  upload(path, data, metadata) {
    const storageRef = this.storage.ref(path);
    const ref2 = createStorageRef(storageRef);
    return ref2.put(data, metadata);
  }
  static ɵfac = function AngularFireStorage_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AngularFireStorage)(ɵɵinject(FIREBASE_OPTIONS), ɵɵinject(FIREBASE_APP_NAME, 8), ɵɵinject(BUCKET, 8), ɵɵinject(PLATFORM_ID), ɵɵinject(NgZone), ɵɵinject(ɵAngularFireSchedulers), ɵɵinject(MAX_UPLOAD_RETRY_TIME, 8), ɵɵinject(MAX_OPERATION_RETRY_TIME, 8), ɵɵinject(USE_EMULATOR, 8), ɵɵinject(ɵAppCheckInstances, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AngularFireStorage,
    factory: _AngularFireStorage.ɵfac,
    providedIn: "any"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireStorage, [{
    type: Injectable,
    args: [{
      providedIn: "any"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [FIREBASE_OPTIONS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FIREBASE_APP_NAME]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [BUCKET]
    }]
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: NgZone
  }, {
    type: ɵAngularFireSchedulers
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [MAX_UPLOAD_RETRY_TIME]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [MAX_OPERATION_RETRY_TIME]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR]
    }]
  }, {
    type: ɵAppCheckInstances,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
var GetDownloadURLPipe = class _GetDownloadURLPipe {
  storage;
  state;
  asyncPipe;
  path;
  downloadUrl$;
  constructor(storage, cdr, state) {
    this.storage = storage;
    this.state = state;
    this.asyncPipe = new AsyncPipe(cdr);
  }
  transform(path) {
    if (path !== this.path) {
      this.path = path;
      const key = makeStateKey(`|getDownloadURL|${path}`);
      const existing = this.state?.get(key, void 0);
      this.downloadUrl$ = existing ? of(existing) : this.storage.ref(path).getDownloadURL().pipe(tap((it) => this.state?.set(key, it)));
    }
    return this.asyncPipe.transform(this.downloadUrl$);
  }
  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }
  static ɵfac = function GetDownloadURLPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GetDownloadURLPipe)(ɵɵdirectiveInject(AngularFireStorage, 16), ɵɵdirectiveInject(ChangeDetectorRef, 16), ɵɵdirectiveInject(TransferState, 24));
  };
  static ɵpipe = ɵɵdefinePipe({
    name: "getDownloadURL",
    type: _GetDownloadURLPipe,
    pure: false
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GetDownloadURLPipe, [{
    type: Pipe,
    args: [{
      name: "getDownloadURL",
      pure: false
    }]
  }], () => [{
    type: AngularFireStorage
  }, {
    type: ChangeDetectorRef
  }, {
    type: TransferState,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
var GetDownloadURLPipeModule = class _GetDownloadURLPipeModule {
  static ɵfac = function GetDownloadURLPipeModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GetDownloadURLPipeModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _GetDownloadURLPipeModule,
    declarations: [GetDownloadURLPipe],
    exports: [GetDownloadURLPipe]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GetDownloadURLPipeModule, [{
    type: NgModule,
    args: [{
      declarations: [GetDownloadURLPipe],
      exports: [GetDownloadURLPipe]
    }]
  }], null, null);
})();
var AngularFireStorageModule = class _AngularFireStorageModule {
  constructor() {
    firebase.registerVersion("angularfire", VERSION2.full, "gcs-compat");
  }
  static ɵfac = function AngularFireStorageModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AngularFireStorageModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFireStorageModule,
    exports: [GetDownloadURLPipeModule]
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [AngularFireStorage],
    imports: [GetDownloadURLPipeModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireStorageModule, [{
    type: NgModule,
    args: [{
      exports: [GetDownloadURLPipeModule],
      providers: [AngularFireStorage]
    }]
  }], () => [], null);
})();
export {
  AngularFireStorage,
  AngularFireStorageModule,
  BUCKET,
  GetDownloadURLPipe,
  GetDownloadURLPipeModule,
  MAX_OPERATION_RETRY_TIME,
  MAX_UPLOAD_RETRY_TIME,
  USE_EMULATOR,
  createStorageRef,
  createUploadTask,
  fromTask
};
/*! Bundled license information:

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage-compat/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *  http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=@angular_fire_compat_storage.js.map
