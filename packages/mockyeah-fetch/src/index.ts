// eslint-disable-next-line spaced-comment
/// <reference lib="dom" />
/* eslint-disable no-underscore-dangle */
import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import flatten from 'lodash/flatten';
import cookie from 'cookie';
import debug from 'debug';
import matches from 'match-deep';
import { normalize } from './normalize';
import { isMockEqual } from './isMockEqual';
import { respond } from './respond';
import { Expectation } from './Expectation';
import { handleEmptyBody } from './handleEmptyBody';
import { parseResponseBody } from './parseResponseBody';
import { headersToObject } from './headersToObject';
import { postMessageToServiceWorker, registerServiceWorker } from './registerServiceWorker';
import { uuid } from './uuid';
import {
  BootOptions,
  FetchOptions,
  MockNormal,
  MockFunction,
  MockReturn,
  Match,
  MatchObject,
  Method,
  ResponseOptions,
  ResponseOptionsObject,
  RequestForHandler,
  ResponseObject,
  Action,
  responseOptionsResponderKeys,
  MakeMockOptions,
  MakeMockReturn,
  ActionMockyeahServiceWorkerDataResponse,
  ActionMockyeahServiceWorkerDataRequest
} from './types';

const debugMock = debug('mockyeah:fetch:mock');
const debugHit = debug('mockyeah:fetch:hit');
const debugMiss = debug('mockyeah:fetch:miss');
const debugMissEach = debug('mockyeah:fetch:miss:each');
const debugError = debug('mockyeah:fetch:error');
const debugAdmin = debug('mockyeah:fetch:admin');
const debugAdminError = debug('mockyeah:fetch:admin:error');

let serviceWorkerRequestId = 0;
const serviceWorkerFetches: Record<
  string,
  {
    response: ResponseObject;
  }
> = {};

const DEFAULT_BOOT_OPTIONS: Readonly<BootOptions> = {};

const methodize = (match: Match, method: Method): MatchObject => {
  const matchObject = isPlainObject(match)
    ? (match as MatchObject)
    : ({ url: match } as MatchObject);
  return { ...matchObject, method };
};

const getDefaultBootOptions = (bootOptions: Readonly<BootOptions>) => {
  const {
    name = 'default',
    noProxy = false,
    prependServerURL = false,
    noPolyfill = false,
    noWebSocket = false,
    host = 'localhost',
    port = 4001,
    portHttps, // e.g., 4443
    adminHost = host,
    adminPort = 4777,
    suiteHeader = 'x-mockyeah-suite',
    suiteCookie = 'mockyeahSuite',
    latency,
    ignorePrefix = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}/`,
    aliases = [],
    responseHeaders = true,
    // @ts-ignore
    fetch = global.fetch,
    fileResolver,
    fixtureResolver,
    mockSuiteResolver,
    devTools = false,
    devToolsTimeout = 2000,
    devToolsInterval = 100,
    serviceWorker,
    serviceWorkerRegister = serviceWorker,
    serviceWorkerURL = '/__mockyeahServiceWorker.js',
    serviceWorkerScope = '/'
  } = bootOptions;

  const defaultBootOptions = {
    name,
    noProxy,
    prependServerURL,
    noPolyfill,
    noWebSocket,
    host,
    port,
    portHttps,
    adminHost,
    adminPort,
    suiteHeader,
    suiteCookie,
    latency,
    ignorePrefix,
    aliases,
    responseHeaders,
    fetch,
    fileResolver,
    fixtureResolver,
    mockSuiteResolver,
    devTools,
    devToolsTimeout,
    devToolsInterval,
    serviceWorker,
    serviceWorkerRegister,
    serviceWorkerURL,
    serviceWorkerScope
  };

  return defaultBootOptions;
};

class Mockyeah {
  private __private: {
    recording: boolean;
    bootOptions: Readonly<ReturnType<typeof getDefaultBootOptions>>;
    ws?: WebSocket;
    logPrefix: string;
    mocks: MockNormal[];
    aliasReplacements?: Record<string, string[]>;
    devToolsFound: boolean;
    skipDevToolsCheck: boolean;
  };

  methods: Record<string, MockFunction>;

  constructor(bootOptions: Readonly<BootOptions> = DEFAULT_BOOT_OPTIONS) {
    const defaultBootOptions = getDefaultBootOptions(bootOptions);

    const {
      name,
      noPolyfill,
      aliases,
      fetch,
      serviceWorker,
      serviceWorkerRegister,
      serviceWorkerURL,
      serviceWorkerScope
    } = defaultBootOptions;

    this.__private = {
      recording: false,
      bootOptions: defaultBootOptions,
      logPrefix: `[${name}]`,
      mocks: [],
      devToolsFound: false,
      skipDevToolsCheck: false
    };

    const { logPrefix } = this.__private;

    if (!fetch) {
      const errorMessage = `${logPrefix} @mockyeah/fetch requires a fetch implementation`;
      debugError(errorMessage);
      throw new Error(errorMessage);
    }

    const aliasReplacements: Record<string, string[]> = {};

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

    if (serviceWorker && typeof window !== 'undefined') {
      if (serviceWorkerRegister) {
        registerServiceWorker({ url: serviceWorkerURL, scope: serviceWorkerScope });
      }

      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'mockyeahServiceWorkerDataRequest') {
          const { data } = event as { data: ActionMockyeahServiceWorkerDataRequest };
          const { requestId } = data.payload || {};

          if (!requestId) return;

          if (serviceWorkerFetches[requestId]) {
            const action: ActionMockyeahServiceWorkerDataResponse = {
              type: 'mockyeahServiceWorkerDataResponse',
              payload: {
                requestId,
                response: serviceWorkerFetches[requestId].response
              }
            };

            postMessageToServiceWorker(action);
          }
        }
      });
    }
  }

  async fetch(
    input: RequestInfo,
    init?: RequestInit,
    fetchOptions: FetchOptions = {}
  ): Promise<Response> {
    const { logPrefix, mocks, bootOptions, aliasReplacements, skipDevToolsCheck } = this.__private;
    const {
      noWebSocket,
      ignorePrefix,
      noProxy: bootNoProxy,
      prependServerURL,
      suiteCookie,
      suiteHeader,
      port,
      portHttps,
      host,
      mockSuiteResolver,
      fetch,
      devTools,
      devToolsTimeout,
      devToolsInterval,
      serviceWorker
    } = bootOptions;

    const { dynamicMocks, dynamicMockSuite, noProxy = bootNoProxy } = fetchOptions;

    if (!noWebSocket) {
      try {
        await this.connectWebSocket();
      } catch (error) {
        // silence
      }
    }

    if (devTools && typeof window !== 'undefined' && !skipDevToolsCheck) {
      await new Promise(resolve => {
        let times = 0;
        const interval = setInterval(() => {
          times += 1;
          if (
            // @ts-ignore
            window.__MOCKYEAH_DEVTOOLS_EXTENSION__
          ) {
            this.__private.devToolsFound = true;
            clearInterval(interval);
            resolve();
          } else if (times > devToolsTimeout / devToolsInterval) {
            this.__private.skipDevToolsCheck = true;
            clearInterval(interval);
            resolve();
          }
        }, devToolsInterval);
      });

      if (this.__private.devToolsFound) {
        await new Promise(resolve => {
          let times = 0;
          const interval = setInterval(() => {
            times += 1;
            if (
              // @ts-ignore
              window.__MOCKYEAH_DEVTOOLS_EXTENSION__?.loadedMocks
            ) {
              clearInterval(interval);
              resolve();
            } else if (times > devToolsTimeout / devToolsInterval) {
              clearInterval(interval);
              resolve();
            }
          }, devToolsInterval);
        });
      }
    }

    // TODO: Support `Request` `input` object instead of `init`.

    let url = typeof input === 'string' ? input : input.url;

    const options = init || {};

    const dynamicMocksNormal = (dynamicMocks || [])
      .map(
        dynamicMock =>
          dynamicMock && this.makeMock(dynamicMock[0], dynamicMock[1], { keepExisting: true }).mock
      )
      .filter(Boolean) as MockNormal[];

    const parsed = parse(url);

    // eslint-disable-next-line no-nested-ternary
    const inHeaders = options.headers
      ? options.headers instanceof Headers
        ? options.headers
        : new Headers(options.headers)
      : undefined;

    // TODO: Handle non-string bodies (Buffer, Form, etc.).
    if (options.body && typeof options.body !== 'string') {
      debugError(
        `${logPrefix} @mockyeah/fetch does not yet support non-string request bodies, falling back to normal fetch`
      );
      return this.fallbackFetch(url, init, { noProxy });
    }

    const inBody = inHeaders && parseResponseBody(inHeaders, options.body);

    const query = parsed.query ? qs.parse(parsed.query) : undefined;
    const method: Method = options.method ? (options.method.toLowerCase() as Method) : 'get';

    // TODO: Handle `Headers` type.
    if (options.headers && !isPlainObject(options.headers)) {
      debugError(
        `${logPrefix} @mockyeah/fetch does not yet support non-object request headers, falling back to normal fetch`
      );
      return this.fallbackFetch(url, init, { noProxy });
    }

    const headers = options.headers as Record<string, string>;

    let cookies;

    try {
      const cookieHeader = headers && (headers.cookie || headers.Cookie);
      if (cookieHeader) {
        cookies = cookie.parse(cookieHeader);
      } else if (typeof window !== 'undefined') {
        cookies = cookie.parse(window.document.cookie);
      }
    } catch (error) {
      debugError(`${logPrefix} @mockyeah/fetch couldn't parse cookies: ${error.message}`);
    }

    const mockSuiteName = dynamicMockSuite || (cookies && cookies[suiteCookie]);

    if (mockSuiteName && mockSuiteResolver) {
      const mockSuiteNames = mockSuiteName.split(',').map(s => s.trim());
      const mockSuiteLoads = mockSuiteNames.map(mockSuiteResolver);
      const mockSuiteLoadeds = await Promise.all(mockSuiteLoads);
      mockSuiteLoadeds.forEach((mockSuiteLoaded, index) => {
        const name = mockSuiteNames[index];
        (mockSuiteLoaded.default || mockSuiteLoaded).forEach(mock => {
          const [match, response] = mock;
          const newMatch = (isPlainObject(match)
            ? { ...(match as MatchObject) }
            : { url: match }) as MatchObject;
          newMatch.cookies = {
            ...newMatch.cookies,
            mockSuite: (value?: string): boolean =>
              value
                ? value
                    .split(',')
                    .map(s => s.trim())
                    .includes(name)
                : false
          };
          dynamicMocksNormal.push(this.makeMock(newMatch, response, { keepExisting: true }).mock);
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

    const incomingNormal = normalize(incoming, true);

    let matchingMock: MockNormal | undefined;

    [
      incomingNormal,
      ...(isPlainObject(incomingNormal)
        ? flatten(
            aliasReplacements &&
              Object.entries(aliasReplacements).map(([alias, aliasSet]) => {
                const { url } = incomingNormal as MatchObject;
                if (typeof url === 'string' && url.replace(/^\//, '').startsWith(alias)) {
                  return aliasSet.map(alias2 => ({
                    ...incomingNormal,
                    url: url.replace(alias, alias2)
                  }));
                }
                return [];
              })
          )
        : [])
    ]
      .filter(Boolean)
      .find(inc => {
        const allMocks = [...dynamicMocksNormal, ...mocks];
        return allMocks.find(m => {
          if (!m) {
            return false;
          }

          const match = m[0];

          const matchResult = matches(inc, match, { skipKeys: ['$meta'] });

          if (matchResult.result) {
            matchingMock = m;
            return true;
          }

          debugMissEach(`${logPrefix} @mockyeah/fetch missed mock for`, url, matchResult.message, {
            request: incoming,
            match
          });

          return false;
        });
      });

    const pathname = `${parsed.protocol ? `${parsed.protocol}//` : ''}${parsed.host ||
      ''}${parsed.pathname || '/'}`;

    const requestForHandler: RequestForHandler = {
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

      let realRes;
      const resOpts = matchingMock[1];

      const intercept =
        resOpts &&
        responseOptionsResponderKeys.some(
          option =>
            // @ts-ignore
            typeof resOpts[option] === 'function' && resOpts[option].length > 1
        );

      if (intercept) {
        const realResponse = await this.fallbackFetch(url, options);

        const body = parseResponseBody(realResponse.headers, await realResponse.text());

        realRes = {
          status: realResponse.status,
          body,
          headers: headersToObject(realResponse.headers)
        };
      }

      const { response, json, body: responseBody, headers: responseHeaders } = await respond(
        matchingMock,
        requestForHandler,
        bootOptions,
        realRes
      );

      if (serviceWorker) {
        const responseObject: ResponseObject = {
          status: response.status,
          body: responseBody,
          headers: responseHeaders
        };

        serviceWorkerRequestId += 1;
        const currentServiceWorkerRequestId = serviceWorkerRequestId;

        serviceWorkerFetches[currentServiceWorkerRequestId] = {
          response: responseObject
        };

        fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'x-mockyeah-service-worker-request': currentServiceWorkerRequestId
          }
        });
      }

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

    let newOptions = options;

    // Consider removing this `prependServerURL` feature.
    if (prependServerURL && serverUrl) {
      url = `${serverUrl}/${url.replace('://', '~~~')}`;

      let suiteName;
      if (typeof document !== 'undefined') {
        const m = document.cookie.match(`\\b${suiteCookie}=([^;]+)\\b`);
        suiteName = m && m[1];
      }

      newOptions = {
        ...options,
        headers: {
          ...options.headers,
          ...(suiteName && {
            [suiteHeader]: suiteName
          })
        }
      };
    }

    return this.fallbackFetch(url, newOptions, { noProxy });
  }

  async fallbackFetch(input: RequestInfo, init?: RequestInit, fetchOptions: FetchOptions = {}) {
    const { noProxy } = fetchOptions;
    const { responseHeaders, fetch } = this.__private.bootOptions;

    const url = typeof input === 'string' ? input : input.url;

    if (noProxy || !url.startsWith('http')) {
      const headers: Record<string, string> = {};
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

    const body = await handleEmptyBody(res);

    const { ws, recording } = this.__private;

    if (recording) {
      const { status } = res;

      const headers = headersToObject(res.headers);

      if (ws) {
        const action: Action = {
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

  expect(match: Match) {
    return this.all('*').expect(match);
  }

  all(match: Match, res?: ResponseOptions) {
    return this.mock(match, res);
  }

  get(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'get'), res);
  }

  post(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'post'), res);
  }

  put(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'put'), res);
  }

  delete(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'delete'), res);
  }

  options(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'options'), res);
  }

  patch(match: Match, res?: ResponseOptions) {
    return this.mock(methodize(match, 'patch'), res);
  }

  reset() {
    this.__private.mocks = [];
  }

  makeMock(match: Match, res?: ResponseOptions, options: MakeMockOptions = {}): MakeMockReturn {
    const { keepExisting } = options;
    const matchNormal = normalize(match);

    const { mocks } = this.__private;

    const removed: MockNormal[] = [];

    let firstExistingIndex;

    if (!keepExisting) {
      const existingIndex = mocks.findIndex(m => isMockEqual(matchNormal, m[0]));
      if (existingIndex >= 0) {
        firstExistingIndex = firstExistingIndex ?? existingIndex;
        removed.push(mocks[existingIndex]);
        mocks.splice(existingIndex, 1);
      }
    }

    let resObj = typeof res === 'string' ? ({ text: res } as ResponseOptionsObject) : res;
    resObj = resObj || ({ status: 200 } as ResponseOptionsObject);

    if (matchNormal.$meta) {
      matchNormal.$meta.expectation = new Expectation(matchNormal);
      matchNormal.$meta.id = uuid();
    }

    return { mock: [matchNormal, resObj], removed, removedIndex: firstExistingIndex };
  }

  mock(match: Match, res?: ResponseOptions): MockReturn {
    const { mock: mockNormal, removed, removedIndex } = this.makeMock(match, res);

    const id = mockNormal[0].$meta?.id as string;

    const { mocks, logPrefix } = this.__private;

    debugMock(`${logPrefix} mocked`, match, res);

    if (removedIndex != null) {
      mocks.splice(removedIndex, 0, mockNormal);
    } else {
      mocks.push(mockNormal);
    }

    const expectation = (mockNormal[0].$meta && mockNormal[0].$meta.expectation) as Expectation;

    const removedIds = removed.map(mock => mock[0]?.$meta?.id) as string[];

    const api = expectation.api.bind(expectation);
    const expect = (_match: Match): Expectation => api(_match);

    return {
      id,
      removedIds,
      expect
    };
  }

  /**
   * Returns true if unmocked, false if not.
   * @param id
   */
  unmock(id: string): boolean {
    const { mocks, logPrefix } = this.__private;
    const index = mocks.findIndex(m => m[0].$meta?.id === id);

    if (index === -1) {
      debugMock(`${logPrefix} didn't find id to unmock`, id);
      return false;
    }

    mocks.splice(index, 1);

    debugMock(`${logPrefix} unmocked`, id);

    return true;
  }

  async connectWebSocket() {
    if (typeof WebSocket === 'undefined') return;
    if (this.__private.ws) return;

    const { adminPort, adminHost } = this.__private.bootOptions;

    const webSocketUrl = `ws://${adminHost}:${adminPort}`;

    debugAdmin(`WebSocket trying to connect to '${webSocketUrl}'.`);

    try {
      this.__private.ws = new WebSocket(webSocketUrl);
    } catch (error) {
      debugAdminError(`WebSocket couldn't connect to '${webSocketUrl}':`, error);

      delete this.__private.ws;

      throw error;
    }

    await new Promise((resolve, reject) => {
      const { ws } = this.__private;

      if (ws) {
        ws.onopen = () => {
          debugAdmin('WebSocket opened');
          ws.send(JSON.stringify({ type: 'opened' }));
          resolve();
        };

        ws.onerror = error => {
          debugAdminError('WebSocket errored', error);
          reject(error);
        };

        ws.onclose = () => {
          debugAdminError('WebSocket closed');

          this.__private.recording = false;

          delete this.__private.ws;

          reject(new Error('WebSocket closed'));
        };

        ws.onmessage = (event: MessageEvent) => {
          debugAdmin('WebSocket message', event);

          let action: Action | undefined;
          try {
            action = JSON.parse(event.data);
          } catch (error) {
            debugAdminError(`Couldn't parse WebSocket message data '${event.data}':`, error);
            return;
          }

          if (!action) return;

          debugAdmin('WebSocket action', action);

          if (action.type === 'record') {
            this.__private.recording = true;
          } else if (action.type === 'recordStop') {
            this.__private.recording = false;
          }
        };
      }
    });
  }
}

export default Mockyeah;
