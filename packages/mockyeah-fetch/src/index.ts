import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import flatten from 'lodash/flatten';
import matches from 'match-deep';
import { normalize } from './normalize';
import { isMockEqual } from './isMockEqual';
import { respond } from './respond';
import { Expectation } from './Expectation';
import {
  BootOptions,
  FetchOptions,
  MockNormal,
  Match,
  MatchObject,
  Method,
  ResponseOptions,
  ResponseOptionsObject,
  responseOptionsKeys,
  RequestForHandler
} from './types';

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
      responseHeaders = true,
      // This is the fallback fetch when no mocks match.
      // @ts-ignore
      fetch = global.fetch
    } = bootOptions;

    if (!fetch) {
      throw new Error('@mockyeah/fetch requires a fetch implementation');
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

      if (Object.keys(resObj).some(key => !responseOptionsKeys.includes(key))) {
        throw new Error(
          `Response option(s) invalid. Options must include one of the following: ${responseOptionsKeys.join(
            ', '
          )}`
        );
      }

      if (matchNormal.$meta) {
        matchNormal.$meta.expectation = new Expectation(matchNormal);
      }

      return [matchNormal, resObj];
    };

    const mock = (match: Match, res?: ResponseOptions) => {
      const mockNormal = makeMock(match, res);
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
      const { proxy } = fetchOptions;

      const url = typeof input === 'string' ? input : input.url;

      if (!proxy || !url.startsWith('http')) {
        const headers: Record<string, string> = {};
        if (responseHeaders) {
          headers['x-mockyeah-missed'] = 'true';
        }
        return new Response(undefined, {
          status: 404,
          headers
        });
      }

      let res = await fetch(input, init);

      if (responseHeaders) {
        const { status, statusText, headers } = res;
        const newHeaders = headers && new Headers(headers);
        if (newHeaders) {
          newHeaders.set('x-mockyeah-proxied', 'true');
          newHeaders.set('x-mockyeah-missed', 'true');
        }
        res = new Response(res.body, {
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
      { dynamicMocks, proxy = defaultProxy }: FetchOptions = {}
    ): Promise<Response> => {
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
        // eslint-disable-next-line no-console
        console.error('@mockyeah/fetch does not yet support non-string request bodies');
        return fallbackFetch(url, init);
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
        console.error('@mockyeah/fetch does not yet support non-object request headers');
        return fallbackFetch(url, init);
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

            return false;
          });
        });

      const pathname = parsed.pathname || '/';

      const requestForHandler: RequestForHandler = {
        url: pathname,
        path: pathname,
        query,
        method,
        headers,
        body: inBody
        // TODO: `cookies, etc.
      };

      if (matchingMock) {
        if (matchingMock[0] && matchingMock[0].$meta && matchingMock[0].$meta.expectation) {
          // May throw error, which will cause the promise to reject.
          matchingMock[0].$meta.expectation.request(requestForHandler);
        }

        return respond(matchingMock, requestForHandler, bootOptions);
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

      return fallbackFetch(url, newOptions, { proxy });
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
}

export default Mockyeah;
