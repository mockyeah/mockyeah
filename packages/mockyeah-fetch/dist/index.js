"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const url_1 = require("url");
const qs_1 = __importDefault(require("qs"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const flatten_1 = __importDefault(require("lodash/flatten"));
const fromPairs_1 = __importDefault(require("lodash/fromPairs"));
const cookie_1 = __importDefault(require("cookie"));
const debug_1 = __importDefault(require("debug"));
const match_deep_1 = __importDefault(require("match-deep"));
const normalize_1 = require("./normalize");
const isMockEqual_1 = require("./isMockEqual");
const respond_1 = require("./respond");
const Expectation_1 = require("./Expectation");
const parseBody_1 = require("./parseBody");
const debugMock = debug_1.default('mockyeah:fetch:mock');
const debugHit = debug_1.default('mockyeah:fetch:hit');
const debugMiss = debug_1.default('mockyeah:fetch:miss');
const debugMissEach = debug_1.default('mockyeah:fetch:miss:each');
const debugError = debug_1.default('mockyeah:fetch:error');
const debugAdmin = debug_1.default('mockyeah:fetch:admin');
const debugAdminError = debug_1.default('mockyeah:fetch:admin:error');
const DEFAULT_BOOT_OPTIONS = {};
const methodize = (match, method) => {
    const matchObject = isPlainObject_1.default(match)
        ? match
        : { url: match };
    return { ...matchObject, method };
};
const getDefaultBootOptions = (bootOptions) => {
    const { name = 'default', noProxy = false, prependServerURL = false, noPolyfill = false, noWebSocket = false, webSocketReconnectInterval = 5000, host = 'localhost', port = 4001, portHttps, // e.g., 4443
    adminHost = host, adminPort = 4777, suiteHeader = 'x-mockyeah-suite', suiteCookie = 'mockyeahSuite', ignorePrefix = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}/`, aliases = [], responseHeaders = true, 
    // This is the fallback fetch when no mocks match.
    // @ts-ignore
    fetch = global.fetch, fileResolver, fixtureResolver, mockSuiteResolver } = bootOptions;
    const defaultBootOptions = {
        name,
        noProxy,
        prependServerURL,
        noPolyfill,
        noWebSocket,
        webSocketReconnectInterval,
        host,
        port,
        portHttps,
        adminHost,
        adminPort,
        suiteHeader,
        suiteCookie,
        ignorePrefix,
        aliases,
        responseHeaders,
        fetch,
        fileResolver,
        fixtureResolver,
        mockSuiteResolver
    };
    return defaultBootOptions;
};
class Mockyeah {
    constructor(bootOptions = DEFAULT_BOOT_OPTIONS) {
        const defaultBootOptions = getDefaultBootOptions(bootOptions);
        const { name, noPolyfill, noWebSocket, aliases, fetch } = defaultBootOptions;
        this.__private = {
            recording: false,
            bootOptions: defaultBootOptions,
            logPrefix: `[${name}]`,
            mocks: []
        };
        const { logPrefix } = this.__private;
        if (!fetch) {
            const errorMessage = `${logPrefix} @mockyeah/fetch requires a fetch implementation`;
            debugError(errorMessage);
            throw new Error(errorMessage);
        }
        if (!noWebSocket) {
            try {
                this.connectWebSocket();
            }
            catch (error) {
                // silence
            }
        }
        const aliasReplacements = {};
        (aliases || []).forEach(aliasSet => {
            aliasSet.forEach(alias => {
                aliasReplacements[alias] = aliasSet;
            });
        });
        this.__private.aliasReplacements = aliasReplacements;
        if (!noPolyfill) {
            // @ts-ignore
            global.fetch = this.fetch.bind(this);
        }
        const methods = {
            all: this.all.bind(this),
            get: this.get.bind(this),
            post: this.post.bind(this),
            put: this.put.bind(this),
            delete: this.delete.bind(this),
            options: this.options.bind(this),
            patch: this.patch.bind(this)
        };
        this.methods = methods;
    }
    async fetch(input, init, fetchOptions = {}) {
        const { logPrefix, mocks, bootOptions, aliasReplacements } = this.__private;
        const { noWebSocket, ignorePrefix, noProxy: bootNoProxy, prependServerURL, suiteCookie, suiteHeader, port, portHttps, host, mockSuiteResolver } = bootOptions;
        const { dynamicMocks, dynamicMockSuite, noProxy = bootNoProxy } = fetchOptions;
        if (!noWebSocket) {
            try {
                await this.connectWebSocket();
            }
            catch (error) {
                // silence
            }
        }
        // TODO: Support `Request` `input` object instead of `init`.
        let url = typeof input === 'string' ? input : input.url;
        const options = init || {};
        const dynamicMocksNormal = (dynamicMocks || [])
            .map(dynamicMock => dynamicMock && this.makeMock(...dynamicMock))
            .filter(Boolean);
        const parsed = url_1.parse(url);
        // eslint-disable-next-line no-nested-ternary
        const inHeaders = options.headers
            ? options.headers instanceof Headers
                ? options.headers
                : new Headers(options.headers)
            : undefined;
        // TODO: Handle non-string bodies (Buffer, Form, etc.).
        if (options.body && typeof options.body !== 'string') {
            debugError(`${logPrefix} @mockyeah/fetch does not yet support non-string request bodies, falling back to normal fetch`);
            return this.fallbackFetch(url, init, { noProxy });
        }
        // TODO: Does this handle lowercase `content-type`?
        const contentType = inHeaders && inHeaders.get('Content-Type');
        // TODO: More robust content-type parsing.
        const isBodyJson = contentType && contentType.includes('application/json');
        const inBody = options.body && isBodyJson
            ? JSON.parse(options.body)
            : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
                options.body;
        const query = parsed.query ? qs_1.default.parse(parsed.query) : undefined;
        const method = options.method ? options.method.toLowerCase() : 'get';
        // TODO: Handle `Headers` type.
        if (options.headers && !isPlainObject_1.default(options.headers)) {
            debugError(`${logPrefix} @mockyeah/fetch does not yet support non-object request headers, falling back to normal fetch`);
            return this.fallbackFetch(url, init, { noProxy });
        }
        const headers = options.headers;
        let cookies;
        try {
            const cookieHeader = headers && (headers.cookie || headers.Cookie);
            if (cookieHeader) {
                cookies = cookie_1.default.parse(cookieHeader);
            }
            else if (typeof window !== 'undefined') {
                cookies = cookie_1.default.parse(window.document.cookie);
            }
        }
        catch (error) {
            debugError(`${logPrefix} @mockyeah/fetch couldn't parse cookies: ${error.message}`);
        }
        const mockSuiteName = dynamicMockSuite || (cookies && cookies[suiteCookie]);
        if (mockSuiteName && mockSuiteResolver) {
            const mockSuiteNames = mockSuiteName.split(',').map(s => s.trim());
            const mockSuiteLoads = mockSuiteNames.map(mockSuiteResolver);
            const mockSuiteLoadeds = await Promise.all(mockSuiteLoads);
            mockSuiteLoadeds.forEach((mockSuiteLoaded, index) => {
                const name = mockSuiteNames[index];
                const { default: mockSuite } = mockSuiteLoaded;
                mockSuite.forEach(mock => {
                    const [match, response] = mock;
                    const newMatch = (isPlainObject_1.default(match)
                        ? { ...match }
                        : { url: match });
                    newMatch.cookies = {
                        ...newMatch.cookies,
                        mockSuite: (value) => value
                            ? value
                                .split(',')
                                .map(s => s.trim())
                                .includes(name)
                            : false
                    };
                    dynamicMocksNormal.push(this.makeMock(newMatch, response));
                });
            });
        }
        const incoming = {
            url: url.replace(ignorePrefix, ''),
            query,
            headers,
            body: inBody,
            method,
            cookies
        };
        let matchingMock;
        [
            incoming,
            ...flatten_1.default(aliasReplacements &&
                Object.entries(aliasReplacements).map(([alias, aliasSet]) => {
                    if (incoming.url.replace(/^\//, '').startsWith(alias)) {
                        return aliasSet.map(alias2 => ({
                            ...incoming,
                            url: url.replace(alias, alias2)
                        }));
                    }
                    return [];
                }))
        ]
            .filter(Boolean)
            .find(inc => {
            const incNorm = normalize_1.normalize(inc, true);
            return [...(dynamicMocksNormal || []).filter(Boolean), ...mocks].find(m => {
                const match = normalize_1.normalize(m[0]);
                const matchResult = match_deep_1.default(incNorm, match, { skipKeys: ['$meta'] });
                if (matchResult.result) {
                    matchingMock = m;
                    return true;
                }
                debugMissEach(`${logPrefix} @mockyeah/fetch missed mock for`, url, matchResult.message, {
                    request: incoming
                });
                return false;
            });
        });
        const pathname = parsed.pathname || '/';
        const requestForHandler = {
            url: pathname,
            path: pathname,
            query,
            method,
            headers,
            body: inBody,
            cookies
        };
        if (matchingMock) {
            if (matchingMock[0] && matchingMock[0].$meta && matchingMock[0].$meta.expectation) {
                // May throw error, which will cause the promise to reject.
                matchingMock[0].$meta.expectation.request(requestForHandler);
            }
            const { response, json } = await respond_1.respond(matchingMock, requestForHandler, bootOptions);
            debugHit(`${logPrefix} @mockyeah/fetch matched mock for`, url, {
                request: requestForHandler,
                response,
                json,
                mock: matchingMock
            });
            return response;
        }
        debugMiss(`${logPrefix} @mockyeah/fetch missed all mocks for`, url, {
            request: requestForHandler
        });
        const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;
        // Consider removing this `prependServerURL` feature.
        if (prependServerURL && serverUrl) {
            url = `${serverUrl}/${url.replace('://', '~~~')}`;
        }
        let suiteName;
        if (typeof document !== 'undefined') {
            const m = document.cookie.match(`\\b${suiteCookie}=([^;]+)\\b`);
            suiteName = m && m[1];
        }
        const newOptions = {
            ...options,
            headers: {
                ...options.headers,
                ...(suiteName && {
                    [suiteHeader]: suiteName
                })
            }
        };
        return this.fallbackFetch(url, newOptions, { noProxy });
    }
    async fallbackFetch(input, init, fetchOptions = {}) {
        const { noProxy } = fetchOptions;
        const { responseHeaders } = this.__private.bootOptions;
        const url = typeof input === 'string' ? input : input.url;
        if (noProxy || !url.startsWith('http')) {
            const headers = {};
            if (responseHeaders) {
                headers['x-mockyeah-missed'] = 'true';
            }
            return new Response('', {
                status: 404,
                headers
            });
        }
        const startTime = new Date().getTime();
        let res = await fetch(input, init);
        const body = await parseBody_1.parseBody(res);
        const { ws, recording } = this.__private;
        if (recording) {
            const { status } = res;
            // @ts-ignore
            const entries = res.headers.entries();
            const headers = fromPairs_1.default([...entries].map(e => [e[0].toLowerCase(), e[1]]));
            if (ws) {
                const action = {
                    type: 'recordPush',
                    payload: {
                        reqUrl: url,
                        req: {
                            method: init && init.method,
                            body: init && init.body
                        },
                        startTime,
                        body,
                        headers,
                        status
                    }
                };
                ws.send(JSON.stringify(action));
            }
        }
        if (responseHeaders) {
            const { status, statusText, headers } = res;
            const newHeaders = headers && new Headers(headers);
            if (newHeaders) {
                newHeaders.set('x-mockyeah-proxied', 'true');
                newHeaders.set('x-mockyeah-missed', 'true');
            }
            res = new Response(body, {
                headers: newHeaders,
                status,
                statusText
            });
        }
        return res;
    }
    expect(match) {
        return this.all('*').expect(match);
    }
    all(match, res) {
        return this.mock(match, res);
    }
    get(match, res) {
        return this.mock(methodize(match, 'get'), res);
    }
    post(match, res) {
        return this.mock(methodize(match, 'post'), res);
    }
    put(match, res) {
        return this.mock(methodize(match, 'put'), res);
    }
    delete(match, res) {
        return this.mock(methodize(match, 'delete'), res);
    }
    options(match, res) {
        return this.mock(methodize(match, 'options'), res);
    }
    patch(match, res) {
        return this.mock(methodize(match, 'patch'), res);
    }
    reset() {
        this.__private.mocks = [];
    }
    makeMock(match, res) {
        const matchNormal = normalize_1.normalize(match);
        const { mocks } = this.__private;
        const existingIndex = mocks.findIndex(m => isMockEqual_1.isMockEqual(matchNormal, m[0]));
        if (existingIndex >= 0) {
            mocks.splice(existingIndex, 1);
        }
        let resObj = typeof res === 'string' ? { text: res } : res;
        resObj = resObj || { status: 200 };
        if (matchNormal.$meta) {
            matchNormal.$meta.expectation = new Expectation_1.Expectation(matchNormal);
        }
        return [matchNormal, resObj];
    }
    mock(match, res) {
        const mockNormal = this.makeMock(match, res);
        const { mocks, logPrefix } = this.__private;
        debugMock(`${logPrefix} mocked`, match, res);
        mocks.push(mockNormal);
        const expectation = (mockNormal[0].$meta && mockNormal[0].$meta.expectation);
        const api = expectation.api.bind(expectation);
        const expect = (_match) => api(_match);
        return {
            expect: expect.bind(expectation)
        };
    }
    async connectWebSocket({ retries = Infinity } = {}) {
        if (typeof WebSocket === 'undefined')
            return;
        if (this.__private.ws)
            return;
        const { webSocketReconnectInterval, adminPort, adminHost } = this.__private.bootOptions;
        const webSocketUrl = `ws://${adminHost}:${adminPort}`;
        debugAdmin(`WebSocket trying to connect to '${webSocketUrl}'.`);
        await new Promise((resolve, reject) => {
            try {
                this.__private.ws = new WebSocket(webSocketUrl);
            }
            catch (error) {
                debugAdminError(`WebSocket couldn't connect to '${webSocketUrl}':`, error);
            }
            const { ws } = this.__private;
            if (ws) {
                ws.onopen = () => {
                    debugAdmin('WebSocket opened');
                    ws.send(JSON.stringify({ type: 'opened' }));
                    resolve();
                };
                ws.onerror = error => {
                    debugAdminError('WebSocket errored', error);
                    reject();
                };
                ws.onclose = () => {
                    debugAdminError('WebSocket closed');
                    debugAdmin(`WebSocket will try to re-connect in ${webSocketReconnectInterval} milliseconds.`);
                    delete this.__private.ws;
                    if (retries > 0) {
                        setTimeout(() => {
                            this.connectWebSocket({ retries: retries - 1 });
                        }, webSocketReconnectInterval);
                    }
                    reject();
                };
                ws.onmessage = (event) => {
                    debugAdmin('WebSocket message', event);
                    let action;
                    try {
                        action = JSON.parse(event.data);
                    }
                    catch (error) {
                        debugAdminError(`Couldn't parse WebSocket message data '${event.data}':`, error);
                        return;
                    }
                    if (!action)
                        return;
                    debugAdmin('WebSocket action', action);
                    if (action.type === 'record') {
                        this.__private.recording = true;
                    }
                    else if (action.type === 'recordStop') {
                        this.__private.recording = false;
                    }
                };
            }
        });
    }
}
exports.default = Mockyeah;
//# sourceMappingURL=index.js.map