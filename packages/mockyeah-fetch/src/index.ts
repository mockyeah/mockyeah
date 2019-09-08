import '@babel/polyfill';
import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import flatten from 'lodash/flatten';
import matches from 'match-deep';
import { normalize } from './normalize';
import { isMockEqual } from './isMockEqual';
import { respond } from './respond';
import {
  BootOptions,
  Mock,
  MockNormal,
  Match,
  MatchObject,
  Method,
  ResponseOptions,
  ResponseOptionsObject,
  responseOptionsKeys
} from './types';

interface FetchOptions {
  dynamicMocks?: Mock[];
  proxy?: boolean;
}

interface FetchResponseOptions {
  response: Response;
  mock?: MockNormal;
}

const DEFAULT_BOOT_OPTIONS: BootOptions = {};

class Mockyeah {
  constructor(bootOptions = DEFAULT_BOOT_OPTIONS) {
    const {
      proxy: defaultProxy,
      prependServerURL,
      noPolyfill,
      host = 'localhost',
      port = 4001,
      portHttps, // e.g., 4443
      suiteHeader = 'x-mockyeah-suite',
      suiteCookie = 'mockyeahSuite',
      ignorePrefix = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}/`,
      aliases,
      responseHeaders,
      // This is the fallback fetch when no mocks match.
      // @ts-ignore
      fetch = global.fetch
    } = bootOptions;

    if (!fetch) {
      throw new Error('mockyeah-fetch requires a fetch implementation');
    }

    const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;

    let mocks: MockNormal[] = [];

    const makeMock = (match: Match, res: ResponseOptions): MockNormal => {
      const normal = normalize(match);

      const existingIndex = mocks.findIndex(m => isMockEqual(normal, m[0]));
      if (existingIndex >= 0) {
        mocks.splice(existingIndex, 1);
      }

      let resObj = typeof res === 'string' ? ({ text: res } as ResponseOptionsObject) : res;
      resObj = resObj || ({ status: 200 } as ResponseOptionsObject);

      if (Object.keys(resObj).some(key => !responseOptionsKeys.includes(key))) {
        throw new Error(
          `Response option(s) invalid. Options must include one of the following: ${responseOptionsKeys.join(
            ', '
          )}`
        );
      }

      return [normal, resObj];
    };

    const mock = (match: Match, res: ResponseOptions) => {
      mocks.push(makeMock(match, res));
    };

    const methodize = (match: Match, method: Method): MatchObject => {
      const matchObject = isPlainObject(match)
        ? (match as MatchObject)
        : ({ url: match } as MatchObject);
      return { ...matchObject, method };
    };

    const fallbackFetch = async (
      url: string,
      init: RequestInit,
      fetchOptions: FetchOptions = {}
    ) => {
      const { proxy } = fetchOptions;

      if (!url.startsWith('http') || !proxy) {
        const headers: Record<string, string> = {};
        if (responseHeaders) {
          headers['x-mockyeah-missed'] = 'true';
        }
        return new Response('asd', {
          status: 404,
          headers
        });
      }

      const res = await fetch(url, init);

      if (responseHeaders) {
        res.headers.set('x-mockyeah-proxied', 'true');
        res.headers.set('x-mockyeah-missed', 'true');
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
      init: RequestInit = {},
      { dynamicMocks, proxy = defaultProxy }: FetchOptions = {}
    ): Promise<FetchResponseOptions> => {
      const options = init;
      let url = typeof input === 'string' ? input : input.toString();

      const dynamicMocksNormal = (dynamicMocks || [])
        .map(dynamicMock => dynamicMock && makeMock(...dynamicMock))
        .filter(Boolean);

      try {
        // TODO: Support `Request` object.
        const parsed = parse(url);

        // eslint-disable-next-line no-nested-ternary
        const inHeaders = options.headers
          ? options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers)
          : undefined;

        // TODO: Handle non-string bodies (Buffer, Form, etc.).
        if (options.body && typeof options.body !== 'string') {
          // eslint-disable-next-line no-console
          console.error('mockyeah-fetch does not yet support non-string request bodies');
          return {
            response: await fallbackFetch(url, init)
          };
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
          // eslint-disable-next-line no-console
          console.error('mockyeah-fetch does not yet support non-object request headers');
          return {
            response: await fallbackFetch(url, init)
          };
        }

        const incoming = {
          url: url.replace(ignorePrefix, ''),
          query,
          headers: options.headers as Record<string, string>,
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

              return false;
            });
          });

        const requestForHandler = {
          url,
          query,
          method,
          body: inBody
          // TODO: `cookies`
        };

        if (matchingMock) {
          const responseForMock = await respond(matchingMock, requestForHandler, bootOptions);

          return {
            mock: matchingMock,
            response: responseForMock
          };
        }
      } catch (error) {
        throw error;
      }

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

      return {
        response: await fallbackFetch(url, newOptions, { proxy })
      };
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

    const all = (match: Match, res: ResponseOptions) => mock(match, res);
    const get = (match: Match, res: ResponseOptions) => mock(methodize(match, 'get'), res);
    const post = (match: Match, res: ResponseOptions) => mock(methodize(match, 'post'), res);
    const put = (match: Match, res: ResponseOptions) => mock(methodize(match, 'put'), res);
    const del = (match: Match, res: ResponseOptions) => mock(methodize(match, 'delete'), res);
    const options = (match: Match, res: ResponseOptions) => mock(methodize(match, 'options'), res);
    const patch = (match: Match, res: ResponseOptions) => mock(methodize(match, 'patch'), res);

    const methods = {
      all,
      get,
      post,
      put,
      delete: del,
      options,
      patch
    };

    Object.assign(this, {
      fetch: mockyeahFetch,
      reset,
      mock,
      methods,
      ...methods
    });
  }
}

export default Mockyeah;
