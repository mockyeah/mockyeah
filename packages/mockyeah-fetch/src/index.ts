import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import matches from 'match-deep';
import normalize from './normalize';
import { Match, MatchObject, Method, ResponseOptions } from './types';

type MockNormal = [MatchObject, ResponseOptions];

interface BootOptions {
  proxy?: boolean;
  noPolyfill?: boolean;
  host?: string;
  port?: number;
  portHttps?: number;
  suiteHeader?: string;
  suiteCookie?: string;
  ignorePrefix?: string;
  fetch?: GlobalFetch['fetch'];
}

const DEFAULT_BOOT_OPTIONS: BootOptions = {};

class Mockyeah {
  constructor(bootOptions = DEFAULT_BOOT_OPTIONS) {
    const {
      proxy,
      noPolyfill,
      host = 'localhost',
      port = 4001,
      portHttps, // e.g., 4443
      suiteHeader = 'x-mockyeah-suite',
      suiteCookie = 'mockyeahSuite',
      ignorePrefix = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}/`,
      // This is the fallback fetch when no mocks match.
      // @ts-ignore
      fetch = global.fetch
    } = bootOptions;

    if (!fetch) {
      throw new Error('mockyeah-fetch requires a fetch implementation')
    }

    const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;

    const mocks: MockNormal[] = [];

    const mock = (match: Match, res: ResponseOptions) => {
      mocks.push([normalize(match), res]);
    };

    const methodize = (match: Match, method: Method): MatchObject => {
      const matchObject = isPlainObject(match)
        ? (match as MatchObject)
        : ({ url: match } as MatchObject);
      return { ...matchObject, method };
    };

    const mockyeahFetch = async (input: RequestInfo, init: RequestInit = {}) => {
      const options = init;
      let url = typeof input === 'string' ? input : input.toString();

      try {
        // TODO: Support `Request` object.
        const parsed = parse(url);

        // eslint-disable-next-line no-nested-ternary
        const inHeaders = options.headers
          ? options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers)
          : undefined;

        if (options.body && typeof options.body !== 'string') {
          // eslint-disable-next-line no-console
          console.error('mockyeah-fetch does not yet support non-string request bodies');
          return fetch(input, init);
        }

        const isBodyJson = inHeaders && inHeaders.get('Content-Type') === 'application/json';

        const inBody = options.body && isBodyJson
          ? JSON.parse(options.body)
          : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
            options.body;

        const query = parsed.query ? qs.parse(parsed.query) : undefined;
        const method: Method = options.method ? (options.method.toLowerCase() as Method) : 'get';

        if (options.headers && !isPlainObject(options.headers)) {
          // eslint-disable-next-line no-console
          console.error('mockyeah-fetch does not yet support non-object request headers');
          return fetch(input, init);
        }

        const incoming = normalize(
          {
            url: url.replace(ignorePrefix, ''),
            query,
            headers: options.headers as Record<string, string>, // TODO: Handle `Headers` type.
            body: inBody, // TODO: Handle other `body` types, e.g., `Form`
            method
          },
          true
        );

        const matchingMock = mocks.find(m => {
          const match = normalize(m[0]);
          const report = matches(incoming, match);

          return report.result;
        });

        if (matchingMock) {
          const resOpts: ResponseOptions = matchingMock[1];

          const req = {
            url,
            query,
            method,
            body: inBody
            // TODO: `cookies`
            // TODO: `url`
          };

          let body;
          let contentType;

          if (resOpts.json) {
            // TODO: Promise and function-returning-Promise support
            const json = await (typeof resOpts.json === 'function'
              ? resOpts.json(req)
              : resOpts.json);
            body = JSON.stringify(json);
            contentType = 'application/json';
          } else if (resOpts.text) {
            body = await (typeof resOpts.text === 'function' ? resOpts.text(req) : resOpts.text);
            contentType = 'text/plain; charset=UTF-8';
          }

          const headers: RequestInit['headers'] = {
            'x-mockyeah-mocked': 'true'
          };

          if (contentType) {
            headers['content-type'] = contentType;
          }

          const forwardInit = {
            ...init,
            headers
          };

          const response = new Response(body, forwardInit);

          // TODO: Support latency.
          return response;
        }
      } catch (error) {
        throw error;
      }

      if (proxy && serverUrl) {
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

      return fetch(url, newOptions);
    };

    if (!noPolyfill) {
      // @ts-ignore
      global.fetch = mockyeahFetch;
    }

    const reset = () => {
      // @ts-ignore
      global.fetch = fetch;
    };

    const all = (match: Match, res: ResponseOptions) => mock(match, res);
    const get = (match: Match, res: ResponseOptions) => mock(methodize(match, 'get'), res);
    const post = (match: Match, res: ResponseOptions) => mock(methodize(match, 'post'), res);
    const put = (match: Match, res: ResponseOptions) => mock(methodize(match, 'put'), res);
    const del = (match: Match, res: ResponseOptions) => mock(methodize(match, 'delete'), res);
    const options = (match: Match, res: ResponseOptions) => mock(methodize(match, 'options'), res);

    Object.assign(this, {
      fetch: mockyeahFetch,
      mock,
      all,
      get,
      post,
      put,
      delete: del,
      options,
      reset
    });
  }
}

export default Mockyeah;
