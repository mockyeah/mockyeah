"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
// eslint-disable-next-line spaced-comment
/// <reference lib="dom" />
/* eslint-disable no-underscore-dangle */
var url_1 = require("url");
var qs_1 = __importDefault(require("qs"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var flatten_1 = __importDefault(require("lodash/flatten"));
var cookie_1 = __importDefault(require("cookie"));
var debug_1 = __importDefault(require("debug"));
var match_deep_1 = __importDefault(require("match-deep"));
var normalize_1 = require("./normalize");
var isMockEqual_1 = require("./isMockEqual");
var respond_1 = require("./respond");
var Expectation_1 = require("./Expectation");
var handleEmptyBody_1 = require("./handleEmptyBody");
var parseResponseBody_1 = require("./parseResponseBody");
var headersToObject_1 = require("./headersToObject");
var registerServiceWorker_1 = require("./registerServiceWorker");
var uuid_1 = require("./uuid");
var types_1 = require("./types");
var debugMock = debug_1["default"]('mockyeah:fetch:mock');
var debugHit = debug_1["default"]('mockyeah:fetch:hit');
var debugMiss = debug_1["default"]('mockyeah:fetch:miss');
var debugMissEach = debug_1["default"]('mockyeah:fetch:miss:each');
var debugError = debug_1["default"]('mockyeah:fetch:error');
var debugAdmin = debug_1["default"]('mockyeah:fetch:admin');
var debugAdminError = debug_1["default"]('mockyeah:fetch:admin:error');
var serviceWorkerRequestId = 0;
var serviceWorkerFetches = {};
var DEFAULT_BOOT_OPTIONS = {};
var methodize = function (match, method) {
    var matchObject = isPlainObject_1["default"](match)
        ? match
        : { url: match };
    return __assign(__assign({}, matchObject), { method: method });
};
var getDefaultBootOptions = function (bootOptions) {
    var _a = bootOptions.name, name = _a === void 0 ? 'default' : _a, _b = bootOptions.noProxy, noProxy = _b === void 0 ? false : _b, _c = bootOptions.prependServerURL, prependServerURL = _c === void 0 ? false : _c, _d = bootOptions.noPolyfill, noPolyfill = _d === void 0 ? false : _d, _e = bootOptions.noWebSocket, noWebSocket = _e === void 0 ? false : _e, _f = bootOptions.host, host = _f === void 0 ? 'localhost' : _f, _g = bootOptions.port, port = _g === void 0 ? 4001 : _g, portHttps = bootOptions.portHttps, // e.g., 4443
    _h = bootOptions.adminHost, // e.g., 4443
    adminHost = _h === void 0 ? host : _h, _j = bootOptions.adminPort, adminPort = _j === void 0 ? 4777 : _j, _k = bootOptions.suiteHeader, suiteHeader = _k === void 0 ? 'x-mockyeah-suite' : _k, _l = bootOptions.suiteCookie, suiteCookie = _l === void 0 ? 'mockyeahSuite' : _l, latency = bootOptions.latency, _m = bootOptions.ignorePrefix, ignorePrefix = _m === void 0 ? "http" + (portHttps ? 's' : '') + "://" + host + ":" + (portHttps || port) + "/" : _m, _o = bootOptions.aliases, aliases = _o === void 0 ? [] : _o, _p = bootOptions.responseHeaders, responseHeaders = _p === void 0 ? true : _p, 
    // @ts-ignore
    _q = bootOptions.fetch, 
    // @ts-ignore
    fetch = _q === void 0 ? global.fetch : _q, fileResolver = bootOptions.fileResolver, fixtureResolver = bootOptions.fixtureResolver, mockSuiteResolver = bootOptions.mockSuiteResolver, _r = bootOptions.devTools, devTools = _r === void 0 ? false : _r, _s = bootOptions.devToolsTimeout, devToolsTimeout = _s === void 0 ? 2000 : _s, _t = bootOptions.devToolsInterval, devToolsInterval = _t === void 0 ? 100 : _t, serviceWorker = bootOptions.serviceWorker, _u = bootOptions.serviceWorkerRegister, serviceWorkerRegister = _u === void 0 ? serviceWorker : _u, _v = bootOptions.serviceWorkerURL, serviceWorkerURL = _v === void 0 ? '/__mockyeahServiceWorker.js' : _v, _w = bootOptions.serviceWorkerScope, serviceWorkerScope = _w === void 0 ? '/' : _w;
    var defaultBootOptions = {
        name: name,
        noProxy: noProxy,
        prependServerURL: prependServerURL,
        noPolyfill: noPolyfill,
        noWebSocket: noWebSocket,
        host: host,
        port: port,
        portHttps: portHttps,
        adminHost: adminHost,
        adminPort: adminPort,
        suiteHeader: suiteHeader,
        suiteCookie: suiteCookie,
        latency: latency,
        ignorePrefix: ignorePrefix,
        aliases: aliases,
        responseHeaders: responseHeaders,
        fetch: fetch,
        fileResolver: fileResolver,
        fixtureResolver: fixtureResolver,
        mockSuiteResolver: mockSuiteResolver,
        devTools: devTools,
        devToolsTimeout: devToolsTimeout,
        devToolsInterval: devToolsInterval,
        serviceWorker: serviceWorker,
        serviceWorkerRegister: serviceWorkerRegister,
        serviceWorkerURL: serviceWorkerURL,
        serviceWorkerScope: serviceWorkerScope
    };
    return defaultBootOptions;
};
var Mockyeah = /** @class */ (function () {
    function Mockyeah(bootOptions) {
        if (bootOptions === void 0) { bootOptions = DEFAULT_BOOT_OPTIONS; }
        var defaultBootOptions = getDefaultBootOptions(bootOptions);
        var name = defaultBootOptions.name, noPolyfill = defaultBootOptions.noPolyfill, aliases = defaultBootOptions.aliases, fetch = defaultBootOptions.fetch, serviceWorker = defaultBootOptions.serviceWorker, serviceWorkerRegister = defaultBootOptions.serviceWorkerRegister, serviceWorkerURL = defaultBootOptions.serviceWorkerURL, serviceWorkerScope = defaultBootOptions.serviceWorkerScope;
        this.__private = {
            recording: false,
            bootOptions: defaultBootOptions,
            logPrefix: "[" + name + "]",
            mocks: [],
            devToolsFound: false,
            skipDevToolsCheck: false
        };
        var logPrefix = this.__private.logPrefix;
        if (!fetch) {
            var errorMessage = logPrefix + " @mockyeah/fetch requires a fetch implementation";
            debugError(errorMessage);
            throw new Error(errorMessage);
        }
        var aliasReplacements = {};
        (aliases || []).forEach(function (aliasSet) {
            aliasSet.forEach(function (alias) {
                aliasReplacements[alias] = aliasSet;
            });
        });
        this.__private.aliasReplacements = aliasReplacements;
        if (!noPolyfill) {
            // @ts-ignore
            global.fetch = this.fetch.bind(this);
        }
        var methods = {
            all: this.all.bind(this),
            get: this.get.bind(this),
            post: this.post.bind(this),
            put: this.put.bind(this),
            "delete": this["delete"].bind(this),
            options: this.options.bind(this),
            patch: this.patch.bind(this)
        };
        this.methods = methods;
        if (serviceWorker && typeof window !== 'undefined') {
            if (serviceWorkerRegister) {
                registerServiceWorker_1.registerServiceWorker({ url: serviceWorkerURL, scope: serviceWorkerScope });
            }
            navigator.serviceWorker.addEventListener('message', function (event) {
                if (event.data && event.data.type === 'mockyeahServiceWorkerDataRequest') {
                    var data = event.data;
                    var requestId = (data.payload || {}).requestId;
                    if (!requestId)
                        return;
                    if (serviceWorkerFetches[requestId]) {
                        var action = {
                            type: 'mockyeahServiceWorkerDataResponse',
                            payload: {
                                requestId: requestId,
                                response: serviceWorkerFetches[requestId].response
                            }
                        };
                        registerServiceWorker_1.postMessageToServiceWorker(action);
                    }
                }
            });
        }
    }
    Mockyeah.prototype.fetch = function (input, init, fetchOptions) {
        if (fetchOptions === void 0) { fetchOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, logPrefix, mocks, bootOptions, aliasReplacements, skipDevToolsCheck, noWebSocket, ignorePrefix, bootNoProxy, prependServerURL, suiteCookie, suiteHeader, port, portHttps, host, mockSuiteResolver, fetch, devTools, devToolsTimeout, devToolsInterval, serviceWorker, dynamicMocks, dynamicMockSuite, _b, noProxy, error_1, url, options, dynamicMocksNormal, parsed, inHeaders, inBody, query, method, headers, cookies, cookieHeader, mockSuiteName, mockSuiteNames_1, mockSuiteLoads, mockSuiteLoadeds, incoming, incomingNormal, matchingMock, pathname, requestForHandler, realRes, resOpts_1, intercept, realResponse, body, _c, _d, _e, response, json, responseBody, responseHeaders, responseObject, currentServiceWorkerRequestId, serverUrl, newOptions, suiteName, m;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = this.__private, logPrefix = _a.logPrefix, mocks = _a.mocks, bootOptions = _a.bootOptions, aliasReplacements = _a.aliasReplacements, skipDevToolsCheck = _a.skipDevToolsCheck;
                        noWebSocket = bootOptions.noWebSocket, ignorePrefix = bootOptions.ignorePrefix, bootNoProxy = bootOptions.noProxy, prependServerURL = bootOptions.prependServerURL, suiteCookie = bootOptions.suiteCookie, suiteHeader = bootOptions.suiteHeader, port = bootOptions.port, portHttps = bootOptions.portHttps, host = bootOptions.host, mockSuiteResolver = bootOptions.mockSuiteResolver, fetch = bootOptions.fetch, devTools = bootOptions.devTools, devToolsTimeout = bootOptions.devToolsTimeout, devToolsInterval = bootOptions.devToolsInterval, serviceWorker = bootOptions.serviceWorker;
                        dynamicMocks = fetchOptions.dynamicMocks, dynamicMockSuite = fetchOptions.dynamicMockSuite, _b = fetchOptions.noProxy, noProxy = _b === void 0 ? bootNoProxy : _b;
                        if (!!noWebSocket) return [3 /*break*/, 4];
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connectWebSocket()];
                    case 2:
                        _g.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _g.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(devTools && typeof window !== 'undefined' && !skipDevToolsCheck)) return [3 /*break*/, 7];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var times = 0;
                                var interval = setInterval(function () {
                                    times += 1;
                                    if (
                                    // @ts-ignore
                                    window.__MOCKYEAH_DEVTOOLS_EXTENSION__) {
                                        _this.__private.devToolsFound = true;
                                        clearInterval(interval);
                                        resolve();
                                    }
                                    else if (times > devToolsTimeout / devToolsInterval) {
                                        _this.__private.skipDevToolsCheck = true;
                                        clearInterval(interval);
                                        resolve();
                                    }
                                }, devToolsInterval);
                            })];
                    case 5:
                        _g.sent();
                        if (!this.__private.devToolsFound) return [3 /*break*/, 7];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var times = 0;
                                var interval = setInterval(function () {
                                    var _a;
                                    times += 1;
                                    if ((_a = 
                                    // @ts-ignore
                                    window.__MOCKYEAH_DEVTOOLS_EXTENSION__) === null || _a === void 0 ? void 0 : _a.loadedMocks) {
                                        clearInterval(interval);
                                        resolve();
                                    }
                                    else if (times > devToolsTimeout / devToolsInterval) {
                                        clearInterval(interval);
                                        resolve();
                                    }
                                }, devToolsInterval);
                            })];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7:
                        url = typeof input === 'string' ? input : input.url;
                        options = init || {};
                        dynamicMocksNormal = (dynamicMocks || [])
                            .map(function (dynamicMock) {
                            return dynamicMock && _this.makeMock(dynamicMock[0], dynamicMock[1], { keepExisting: true }).mock;
                        })
                            .filter(Boolean);
                        parsed = url_1.parse(url);
                        inHeaders = options.headers
                            ? options.headers instanceof Headers
                                ? options.headers
                                : new Headers(options.headers)
                            : undefined;
                        // TODO: Handle non-string bodies (Buffer, Form, etc.).
                        if (options.body && typeof options.body !== 'string') {
                            debugError(logPrefix + " @mockyeah/fetch does not yet support non-string request bodies, falling back to normal fetch");
                            return [2 /*return*/, this.fallbackFetch(url, init, { noProxy: noProxy })];
                        }
                        inBody = inHeaders && parseResponseBody_1.parseResponseBody(inHeaders, options.body);
                        query = parsed.query ? qs_1["default"].parse(parsed.query) : undefined;
                        method = options.method ? options.method.toLowerCase() : 'get';
                        // TODO: Handle `Headers` type.
                        if (options.headers && !isPlainObject_1["default"](options.headers)) {
                            debugError(logPrefix + " @mockyeah/fetch does not yet support non-object request headers, falling back to normal fetch");
                            return [2 /*return*/, this.fallbackFetch(url, init, { noProxy: noProxy })];
                        }
                        headers = options.headers;
                        try {
                            cookieHeader = headers && (headers.cookie || headers.Cookie);
                            if (cookieHeader) {
                                cookies = cookie_1["default"].parse(cookieHeader);
                            }
                            else if (typeof window !== 'undefined') {
                                cookies = cookie_1["default"].parse(window.document.cookie);
                            }
                        }
                        catch (error) {
                            debugError(logPrefix + " @mockyeah/fetch couldn't parse cookies: " + error.message);
                        }
                        mockSuiteName = dynamicMockSuite || (cookies && cookies[suiteCookie]);
                        if (!(mockSuiteName && mockSuiteResolver)) return [3 /*break*/, 9];
                        mockSuiteNames_1 = mockSuiteName.split(',').map(function (s) { return s.trim(); });
                        mockSuiteLoads = mockSuiteNames_1.map(mockSuiteResolver);
                        return [4 /*yield*/, Promise.all(mockSuiteLoads)];
                    case 8:
                        mockSuiteLoadeds = _g.sent();
                        mockSuiteLoadeds.forEach(function (mockSuiteLoaded, index) {
                            var name = mockSuiteNames_1[index];
                            (mockSuiteLoaded["default"] || mockSuiteLoaded).forEach(function (mock) {
                                var match = mock[0], response = mock[1];
                                var newMatch = (isPlainObject_1["default"](match)
                                    ? __assign({}, match) : { url: match });
                                newMatch.cookies = __assign(__assign({}, newMatch.cookies), { mockSuite: function (value) {
                                        return value
                                            ? value
                                                .split(',')
                                                .map(function (s) { return s.trim(); })
                                                .includes(name)
                                            : false;
                                    } });
                                dynamicMocksNormal.push(_this.makeMock(newMatch, response, { keepExisting: true }).mock);
                            });
                        });
                        _g.label = 9;
                    case 9:
                        incoming = {
                            url: url.replace(ignorePrefix, ''),
                            query: query,
                            headers: headers,
                            body: inBody,
                            method: method,
                            cookies: cookies
                        };
                        incomingNormal = normalize_1.normalize(incoming, true);
                        __spreadArrays([
                            incomingNormal
                        ], (isPlainObject_1["default"](incomingNormal)
                            ? flatten_1["default"](aliasReplacements &&
                                Object.entries(aliasReplacements).map(function (_a) {
                                    var alias = _a[0], aliasSet = _a[1];
                                    var url = incomingNormal.url;
                                    if (typeof url === 'string' && url.replace(/^\//, '').startsWith(alias)) {
                                        return aliasSet.map(function (alias2) { return (__assign(__assign({}, incomingNormal), { url: url.replace(alias, alias2) })); });
                                    }
                                    return [];
                                }))
                            : [])).filter(Boolean)
                            .find(function (inc) {
                            return __spreadArrays((dynamicMocksNormal || []).filter(Boolean), mocks).find(function (m) {
                                var match = normalize_1.normalize(m[0]);
                                var matchResult = match_deep_1["default"](inc, match, { skipKeys: ['$meta'] });
                                if (matchResult.result) {
                                    matchingMock = m;
                                    return true;
                                }
                                debugMissEach(logPrefix + " @mockyeah/fetch missed mock for", url, matchResult.message, {
                                    request: incoming
                                });
                                return false;
                            });
                        });
                        pathname = "" + (parsed.protocol ? parsed.protocol + "//" : '') + (parsed.host ||
                            '') + (parsed.pathname || '/');
                        requestForHandler = {
                            url: pathname,
                            path: pathname,
                            query: query,
                            method: method,
                            headers: headers,
                            body: inBody,
                            cookies: cookies
                        };
                        if (!matchingMock) return [3 /*break*/, 14];
                        if (matchingMock[0] && matchingMock[0].$meta && matchingMock[0].$meta.expectation) {
                            // May throw error, which will cause the promise to reject.
                            matchingMock[0].$meta.expectation.request(requestForHandler);
                        }
                        realRes = void 0;
                        resOpts_1 = matchingMock[1];
                        intercept = resOpts_1 &&
                            types_1.responseOptionsResponderKeys.some(function (option) {
                                // @ts-ignore
                                return typeof resOpts_1[option] === 'function' && resOpts_1[option].length > 1;
                            });
                        if (!intercept) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.fallbackFetch(url, options)];
                    case 10:
                        realResponse = _g.sent();
                        _c = parseResponseBody_1.parseResponseBody;
                        _d = [realResponse.headers];
                        return [4 /*yield*/, realResponse.text()];
                    case 11:
                        body = _c.apply(void 0, _d.concat([_g.sent()]));
                        realRes = {
                            status: realResponse.status,
                            body: body,
                            headers: headersToObject_1.headersToObject(realResponse.headers)
                        };
                        _g.label = 12;
                    case 12: return [4 /*yield*/, respond_1.respond(matchingMock, requestForHandler, bootOptions, realRes)];
                    case 13:
                        _e = _g.sent(), response = _e.response, json = _e.json, responseBody = _e.body, responseHeaders = _e.headers;
                        if (serviceWorker) {
                            responseObject = {
                                status: response.status,
                                body: responseBody,
                                headers: responseHeaders
                            };
                            serviceWorkerRequestId += 1;
                            currentServiceWorkerRequestId = serviceWorkerRequestId;
                            serviceWorkerFetches[currentServiceWorkerRequestId] = {
                                response: responseObject
                            };
                            fetch(url, __assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), { 'x-mockyeah-service-worker-request': currentServiceWorkerRequestId }) }));
                        }
                        debugHit(logPrefix + " @mockyeah/fetch matched mock for", url, {
                            request: requestForHandler,
                            response: response,
                            json: json,
                            mock: matchingMock
                        });
                        return [2 /*return*/, response];
                    case 14:
                        debugMiss(logPrefix + " @mockyeah/fetch missed all mocks for", url, {
                            request: requestForHandler
                        });
                        serverUrl = "http" + (portHttps ? 's' : '') + "://" + host + ":" + (portHttps || port);
                        newOptions = options;
                        // Consider removing this `prependServerURL` feature.
                        if (prependServerURL && serverUrl) {
                            url = serverUrl + "/" + url.replace('://', '~~~');
                            suiteName = void 0;
                            if (typeof document !== 'undefined') {
                                m = document.cookie.match("\\b" + suiteCookie + "=([^;]+)\\b");
                                suiteName = m && m[1];
                            }
                            newOptions = __assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), (suiteName && (_f = {},
                                    _f[suiteHeader] = suiteName,
                                    _f))) });
                        }
                        return [2 /*return*/, this.fallbackFetch(url, newOptions, { noProxy: noProxy })];
                }
            });
        });
    };
    Mockyeah.prototype.fallbackFetch = function (input, init, fetchOptions) {
        if (fetchOptions === void 0) { fetchOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var noProxy, _a, responseHeaders, fetch, url, headers, startTime, res, body, _b, ws, recording, status_1, headers, action, status_2, statusText, headers, newHeaders;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        noProxy = fetchOptions.noProxy;
                        _a = this.__private.bootOptions, responseHeaders = _a.responseHeaders, fetch = _a.fetch;
                        url = typeof input === 'string' ? input : input.url;
                        if (noProxy || !url.startsWith('http')) {
                            headers = {};
                            if (responseHeaders) {
                                headers['x-mockyeah-missed'] = 'true';
                            }
                            return [2 /*return*/, new Response('', {
                                    status: 404,
                                    headers: headers
                                })];
                        }
                        startTime = new Date().getTime();
                        return [4 /*yield*/, fetch(input, init)];
                    case 1:
                        res = _c.sent();
                        return [4 /*yield*/, handleEmptyBody_1.handleEmptyBody(res)];
                    case 2:
                        body = _c.sent();
                        _b = this.__private, ws = _b.ws, recording = _b.recording;
                        if (recording) {
                            status_1 = res.status;
                            headers = headersToObject_1.headersToObject(res.headers);
                            if (ws) {
                                action = {
                                    type: 'recordPush',
                                    payload: {
                                        reqUrl: url,
                                        req: {
                                            method: init && init.method,
                                            body: init && init.body
                                        },
                                        startTime: startTime,
                                        body: body,
                                        headers: headers,
                                        status: status_1
                                    }
                                };
                                ws.send(JSON.stringify(action));
                            }
                        }
                        if (responseHeaders) {
                            status_2 = res.status, statusText = res.statusText, headers = res.headers;
                            newHeaders = headers && new Headers(headers);
                            if (newHeaders) {
                                newHeaders.set('x-mockyeah-proxied', 'true');
                                newHeaders.set('x-mockyeah-missed', 'true');
                            }
                            res = new Response(body, {
                                headers: newHeaders,
                                status: status_2,
                                statusText: statusText
                            });
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Mockyeah.prototype.expect = function (match) {
        return this.all('*').expect(match);
    };
    Mockyeah.prototype.all = function (match, res) {
        return this.mock(match, res);
    };
    Mockyeah.prototype.get = function (match, res) {
        return this.mock(methodize(match, 'get'), res);
    };
    Mockyeah.prototype.post = function (match, res) {
        return this.mock(methodize(match, 'post'), res);
    };
    Mockyeah.prototype.put = function (match, res) {
        return this.mock(methodize(match, 'put'), res);
    };
    Mockyeah.prototype["delete"] = function (match, res) {
        return this.mock(methodize(match, 'delete'), res);
    };
    Mockyeah.prototype.options = function (match, res) {
        return this.mock(methodize(match, 'options'), res);
    };
    Mockyeah.prototype.patch = function (match, res) {
        return this.mock(methodize(match, 'patch'), res);
    };
    Mockyeah.prototype.reset = function () {
        this.__private.mocks = [];
    };
    Mockyeah.prototype.makeMock = function (match, res, options) {
        if (options === void 0) { options = {}; }
        var keepExisting = options.keepExisting;
        var matchNormal = normalize_1.normalize(match);
        var mocks = this.__private.mocks;
        var removed = [];
        var firstExistingIndex;
        if (!keepExisting) {
            var existingIndex = mocks.findIndex(function (m) { return isMockEqual_1.isMockEqual(matchNormal, m[0]); });
            if (existingIndex >= 0) {
                firstExistingIndex = (firstExistingIndex !== null && firstExistingIndex !== void 0 ? firstExistingIndex : existingIndex);
                removed.push(mocks[existingIndex]);
                mocks.splice(existingIndex, 1);
            }
        }
        var resObj = typeof res === 'string' ? { text: res } : res;
        resObj = resObj || { status: 200 };
        if (matchNormal.$meta) {
            matchNormal.$meta.expectation = new Expectation_1.Expectation(matchNormal);
            matchNormal.$meta.id = uuid_1.uuid();
        }
        return { mock: [matchNormal, resObj], removed: removed, removedIndex: firstExistingIndex };
    };
    Mockyeah.prototype.mock = function (match, res) {
        var _a;
        var _b = this.makeMock(match, res), mockNormal = _b.mock, removed = _b.removed, removedIndex = _b.removedIndex;
        var id = (_a = mockNormal[0].$meta) === null || _a === void 0 ? void 0 : _a.id;
        var _c = this.__private, mocks = _c.mocks, logPrefix = _c.logPrefix;
        debugMock(logPrefix + " mocked", match, res);
        if (removedIndex != null) {
            mocks.splice(removedIndex, 0, mockNormal);
        }
        else {
            mocks.push(mockNormal);
        }
        var expectation = (mockNormal[0].$meta && mockNormal[0].$meta.expectation);
        var removedIds = removed.map(function (mock) { var _a, _b; return (_b = (_a = mock[0]) === null || _a === void 0 ? void 0 : _a.$meta) === null || _b === void 0 ? void 0 : _b.id; });
        var api = expectation.api.bind(expectation);
        var expect = function (_match) { return api(_match); };
        return {
            id: id,
            removedIds: removedIds,
            expect: expect
        };
    };
    /**
     * Returns true if unmocked, false if not.
     * @param id
     */
    Mockyeah.prototype.unmock = function (id) {
        var _a = this.__private, mocks = _a.mocks, logPrefix = _a.logPrefix;
        var index = mocks.findIndex(function (m) { var _a; return ((_a = m[0].$meta) === null || _a === void 0 ? void 0 : _a.id) === id; });
        if (index === -1) {
            debugMock(logPrefix + " didn't find id to unmock", id);
            return false;
        }
        mocks.splice(index, 1);
        debugMock(logPrefix + " unmocked", id);
        return true;
    };
    Mockyeah.prototype.connectWebSocket = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, adminPort, adminHost, webSocketUrl;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof WebSocket === 'undefined')
                            return [2 /*return*/];
                        if (this.__private.ws)
                            return [2 /*return*/];
                        _a = this.__private.bootOptions, adminPort = _a.adminPort, adminHost = _a.adminHost;
                        webSocketUrl = "ws://" + adminHost + ":" + adminPort;
                        debugAdmin("WebSocket trying to connect to '" + webSocketUrl + "'.");
                        try {
                            this.__private.ws = new WebSocket(webSocketUrl);
                        }
                        catch (error) {
                            debugAdminError("WebSocket couldn't connect to '" + webSocketUrl + "':", error);
                            delete this.__private.ws;
                            throw error;
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var ws = _this.__private.ws;
                                if (ws) {
                                    ws.onopen = function () {
                                        debugAdmin('WebSocket opened');
                                        ws.send(JSON.stringify({ type: 'opened' }));
                                        resolve();
                                    };
                                    ws.onerror = function (error) {
                                        debugAdminError('WebSocket errored', error);
                                        reject(error);
                                    };
                                    ws.onclose = function () {
                                        debugAdminError('WebSocket closed');
                                        _this.__private.recording = false;
                                        delete _this.__private.ws;
                                        reject(new Error('WebSocket closed'));
                                    };
                                    ws.onmessage = function (event) {
                                        debugAdmin('WebSocket message', event);
                                        var action;
                                        try {
                                            action = JSON.parse(event.data);
                                        }
                                        catch (error) {
                                            debugAdminError("Couldn't parse WebSocket message data '" + event.data + "':", error);
                                            return;
                                        }
                                        if (!action)
                                            return;
                                        debugAdmin('WebSocket action', action);
                                        if (action.type === 'record') {
                                            _this.__private.recording = true;
                                        }
                                        else if (action.type === 'recordStop') {
                                            _this.__private.recording = false;
                                        }
                                    };
                                }
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Mockyeah;
}());
exports["default"] = Mockyeah;
