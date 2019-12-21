/* eslint-disable no-underscore-dangle */
import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import flatten from 'lodash/flatten';
import fromPairs from 'lodash/fromPairs';
import cookie from 'cookie';
import debug from 'debug';
import matches from 'match-deep';
import { normalize } from './normalize';
import { isMockEqual } from './isMockEqual';
import { respond } from './respond';
import { Expectation } from './Expectation';
import { parseBody } from './parseBody';
import {
  BootOptions,
  ConnectWebSocketOptions,
  FetchOptions,
  MockNormal,
  Match,
  MatchObject,
  Method,
  ResponseOptions,
  ResponseOptionsObject,
  responseOptionsKeys,
  RequestForHandler,
  Action
} from './types';

const debugMock = debug('mockyeah:fetch:mock');
const debugHit = debug('mockyeah:fetch:hit');
const debugMiss = debug('mockyeah:fetch:miss');
const debugMissEach = debug('mockyeah:fetch:miss:each');
const debugError = debug('mockyeah:fetch:error');
const debugAdmin = debug('mockyeah:fetch:admin');
const debugAdminError = debug('mockyeah:fetch:admin:error');

const DEFAULT_BOOT_OPTIONS: Readonly<BootOptions> = {};

class Mockyeah {
  private __private: {
    recording: boolean;
    bootOptions: Readonly<BootOptions>;
    ws?: WebSocket;
  };

  static getDefaultBootOptions(bootOptions: Readonly<BootOptions>) {
    const {
      name = 'default',
      noProxy = false,
      prependServerURL = false,
      noPolyfill = false,
      noWebSocket = false,
      webSocketReconnectInterval = 5000,
      host = 'localhost',
      port = 4001,
      portHttps, // e.g., 4443
      adminHost = host,
      adminPort = 4777,
      suiteHeader = 'x-mockyeah-suite',
      suiteCookie = 'mockyeahSuite',
      ignorePrefix = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}/`,
      aliases = [],
      responseHeaders = true,
      // This is the fallback fetch when no mocks match.
      // @ts-ignore
      fetch = global.fetch
    } = bootOptions;

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
      fetch
    };

    return defaultBootOptions;
  }

  constructor(bootOptions: Readonly<BootOptions> = DEFAULT_BOOT_OPTIONS) {
    const defaultBootOptions = Mockyeah.getDefaultBootOptions(bootOptions);

    const {
      name,
      noProxy: globalNoProxy,
      prependServerURL,
      noPolyfill,
      noWebSocket,
      host,
      port,
      portHttps,
      suiteHeader,
      suiteCookie,
      ignorePrefix,
      aliases,
      responseHeaders,
      fetch
    } = defaultBootOptions;

    this.__private = {
      recording: false,
      bootOptions: defaultBootOptions
    };

    const logPrefix = `[${name}]`;

    if (!fetch) {
      const errorMessage = `${logPrefix} @mockyeah/fetch requires a fetch implementation`;
      debugError(errorMessage);
      throw new Error(errorMessage);
    }

    if (!noWebSocket) {
      try {
        this.connectWebSocket();
      } catch (error) {
        // silence
      }
    }

    const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;

    let mocks: MockNormal[] = [];

    const makeMock = (match: Match, res?: ResponseOptions): MockNormal => {
      const matchNormal = normalize(match);

      const existingIndex = mocks.findIndex(m => isMockEqual(matchNormal, m[0]));
      if (existingIndex >= 0) {
        mocks.splice(existingIndex, 1);
      }

      let resObj = typeof res === 'string' ? ({ text: res } as ResponseOptionsObject) : res;
      resObj = resObj || ({ status: 200 } as ResponseOptionsObject);

      if (matchNormal.$meta) {
        matchNormal.$meta.expectation = new Expectation(matchNormal);
      }

      return [matchNormal, resObj];
    };

    const mock = (match: Match, res?: ResponseOptions) => {
      const mockNormal = makeMock(match, res);

      debugMock(`${logPrefix} mocked`, match, res);

      mocks.push(mockNormal);

      const expectation = mockNormal[0].$meta && mockNormal[0].$meta.expectation;

      const api = expectation.api.bind(expectation);
      const expect = (_match: Match): Expectation => api(_match);

      return {
        expect: expect.bind(expectation)
      };
    };

    const methodize = (match: Match, method: Method): MatchObject => {
      const matchObject = isPlainObject(match)
        ? (match as MatchObject)
        : ({ url: match } as MatchObject);
      return { ...matchObject, method };
    };

    const fallbackFetch = async (
      input: RequestInfo,
      init: RequestInit,
      fetchOptions: FetchOptions = {}
    ) => {
      const { noProxy } = fetchOptions;

      const url = typeof input === 'string' ? input : input.url;

      if (noProxy || !url.startsWith('http')) {
        const headers: Record<string, string> = {};
        if (responseHeaders) {
          headers['x-mockyeah-missed'] = 'true';
        }
        return new Response(undefined, {
          status: 404,
          headers
        });
      }

      const startTime = new Date().getTime();

      let res = await fetch(input, init);

      const body = await parseBody(res);

      const { ws, recording } = this.__private;

      if (recording) {
        const { status } = res;

        const headers = fromPairs([...res.headers.entries()].map(e => [e[0].toLowerCase(), e[1]]));

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
    };

    const aliasReplacements: Record<string, string[]> = {};

    (aliases || []).forEach(aliasSet => {
      aliasSet.forEach(alias => {
        aliasReplacements[alias] = aliasSet;
      });
    });

    const mockyeahFetch = async (
      input: RequestInfo,
      init: RequestInit,
      { dynamicMocks, noProxy = globalNoProxy }: FetchOptions = {}
    ): Promise<Response> => {
      if (!noWebSocket) {
        try {
          await this.connectWebSocket();
        } catch (error) {
          // silence
        }
      }

      // TODO: Support `Request` `input` object instead of `init`.

      let url = typeof input === 'string' ? input : input.url;

      const options = init || {};

      const dynamicMocksNormal = (dynamicMocks || [])
        .map(dynamicMock => dynamicMock && makeMock(...dynamicMock))
        .filter(Boolean);

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
        return fallbackFetch(url, init, { noProxy });
      }

      // TODO: Does this handle lowercase `content-type`?
      const contentType = inHeaders && inHeaders.get('Content-Type');
      // TODO: More robust content-type parsing.
      const isBodyJson = contentType && contentType.includes('application/json');

      const inBody =
        options.body && isBodyJson
          ? JSON.parse(options.body)
          : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
            options.body;

      const query = parsed.query ? qs.parse(parsed.query) : undefined;
      const method: Method = options.method ? (options.method.toLowerCase() as Method) : 'get';

      // TODO: Handle `Headers` type.
      if (options.headers && !isPlainObject(options.headers)) {
        debugError(
          `${logPrefix} @mockyeah/fetch does not yet support non-object request headers, falling back to normal fetch`
        );
        return fallbackFetch(url, init, { noProxy });
      }

      const headers = options.headers as Record<string, string>;

      const incoming = {
        url: url.replace(ignorePrefix, ''),
        query,
        headers,
        body: inBody,
        method
      };

      let matchingMock: MockNormal | undefined;

      [
        incoming,
        ...flatten(
          Object.entries(aliasReplacements).map(([alias, aliasSet]) => {
            if (incoming.url.replace(/^\//, '').startsWith(alias)) {
              return aliasSet.map(alias2 => ({
                ...incoming,
                url: url.replace(alias, alias2)
              }));
            }
            return [];
          })
        )
      ]
        .filter(Boolean)
        .find(inc => {
          const incNorm = normalize(inc, true);

          return [...(dynamicMocksNormal || []).filter(Boolean), ...mocks].find(m => {
            const match = normalize(m[0]);

            const matchResult = matches(incNorm, match, { skipKeys: ['$meta'] });

            if (matchResult.result) {
              matchingMock = m;
              return true;
            }

            debugMissEach(
              `${logPrefix} @mockyeah/fetch missed mock for`,
              url,
              matchResult.message,
              {
                request: incoming
              }
            );

            return false;
          });
        });

      const pathname = parsed.pathname || '/';

      let cookies;

      const cookieHeader = headers && (headers.cookie || headers.Cookie);
      if (cookieHeader) {
        cookies = cookie.parse(cookieHeader);
      } else if (typeof window !== 'undefined') {
        cookies = cookie.parse(window.document.cookie);
      }

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

        const { response, json } = await respond(matchingMock, requestForHandler, bootOptions);

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

      return fallbackFetch(url, newOptions, { noProxy });
    };

    if (!noPolyfill) {
      // @ts-ignore
      global.fetch = mockyeahFetch;
    }

    const reset = () => {
      // @ts-ignore
      // global.fetch = fetch;
      mocks = [];
    };

    const all = (match: Match, res?: ResponseOptions) => mock(match, res);
    const get = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'get'), res);
    const post = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'post'), res);
    const put = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'put'), res);
    const del = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'delete'), res);
    const options = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'options'), res);
    const patch = (match: Match, res?: ResponseOptions) => mock(methodize(match, 'patch'), res);

    const methods = {
      all,
      get,
      post,
      put,
      delete: del,
      options,
      patch
    };

    const expect = (match: Match) => all('*').expect(match);

    Object.assign(this, {
      fetch: mockyeahFetch,
      reset,
      mock,
      methods,
      expect,
      ...methods
    });
  }

  async connectWebSocket({ retries = Infinity }: ConnectWebSocketOptions = {}) {
    if (typeof WebSocket === 'undefined') return;
    if (this.__private.ws) return;

    const { webSocketReconnectInterval, adminPort, adminHost } = this.__private.bootOptions;

    const webSocketUrl = `ws://${adminHost}:${adminPort}`;

    debugAdmin(`WebSocket trying to connect to '${webSocketUrl}'.`);

    await new Promise((resolve, reject) => {
      try {
        this.__private.ws = new WebSocket(webSocketUrl);
      } catch (error) {
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
          debugAdmin(
            `WebSocket will try to re-connect in ${webSocketReconnectInterval} milliseconds.`
          );

          delete this.__private.ws;

          if (retries > 0) {
            setTimeout(() => {
              this.connectWebSocket({ retries: retries - 1 });
            }, webSocketReconnectInterval);
          }

          reject();
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
