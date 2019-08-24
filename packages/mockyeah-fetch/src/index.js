import { parse } from 'url';
import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import matches from 'match-deep';
import normalize from './normalize';

function Mockyeah(bootOptions = {}) {
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
    fetch = global.fetch
  } = bootOptions;

  const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;

  const mocks = [];

  const mock = (match, res) => {
    mocks.push([match, res]);
  };

  const methodize = (match, method) => {
    match = isPlainObject(match) ? match : { url: match };
    return { ...match, method };
  };

  const methods = {
    all: (match, res) => mock(match, res),
    get: (match, res) => mock(methodize(match, 'get'), res),
    post: (match, res) => mock(methodize(match, 'post'), res),
    put: (match, res) => mock(methodize(match, 'put'), res),
    delete: (match, res) => mock(methodize(match, 'delete'), res)
  };

  const mockyeahFetch = (url, options = {}) => {
    try {
      // TODO: Support `Request` object.

      const parsed = parse(url);

      // eslint-disable-next-line no-nested-ternary
      const inHeaders = options.headers
        ? options.headers instanceof Headers
          ? options.headers
          : new Headers(options.headers)
        : undefined;

      const inBody =
        inHeaders && inHeaders.get('Content-Type') === 'application/json'
          ? JSON.parse(options.body)
          : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
            options.body;

      const query = qs.parse(parsed.query);
      const method = options.method && options.method.toLowerCase();

      const incoming = normalize(
        {
          url: url.replace(ignorePrefix, ''),
          query,
          headers: options.headers, // TODO: Handle `Headers` type.
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
        const resOpts = matchingMock[1];

        const req = {
          query,
          method,
          body: inBody
        };

        let body;
        let contentType;

        if (resOpts.json) {
          // TODO: Promise and function-returning-Promise support
          const json = typeof resOpts.json === 'function' ? resOpts.json(req) : resOpts.json;
          body = JSON.stringify(json);
          contentType = 'application/json';
        } else if (resOpts.text) {
          body = typeof resOpts.text === 'function' ? resOpts.text(req) : resOpts.text;
          contentType = 'text/plain; charset=UTF-8';
        }

        const headers = {
          'x-mockyeah-mocked': 'true'
        };

        if (contentType) {
          headers['content-type'] = contentType;
        }

        const init = {
          status: resOpts.status || 200,
          headers
        };

        const response = new Response(body, init);

        // TODO: Support latency.
        return Promise.resolve(response);
      }
    } catch (error) {
      return Promise.reject(error);
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
    global.fetch = mockyeahFetch;
  }

  const reset = () => {
    global.fetch = fetch;
  };

  const api = {
    fetch: mockyeahFetch,
    mock,
    ...methods,
    reset
  };

  return api;
}

export default Mockyeah;
