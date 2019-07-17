import { parse } from 'url';
import qs from 'qs';
import matches from 'match-deep';
import normalize from './normalize';

const originalFetch = global.fetch;

const Mockyeah = (bootOptions = {}) => {
  const {
    proxy,
    noPolyfill,
    host = 'localhost',
    port = 4001,
    portHttps, // e.g., 4443
    suiteHeader = 'x-mockyeah-suite',
    suiteCookie = 'mockyeahSuite'
  } = bootOptions;

  const serverUrl = `http${portHttps ? 's' : ''}://${host}:${portHttps || port}`;

  const mocks = [];

  const mock = (match, res) => {
    mocks.push([match, res]);
  };

  const methodize = (match, method) => {
    match = typeof match === 'string' ? { ...match, url: match } : match;
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
        : options.body;

    const incoming = normalize({
      path: url,
      url,
      query: qs.parse(parsed.query),
      headers: options.headers, // TODO: Handle `Headers` type.
      body: inBody, // TODO: Handle other `body` types, e.g., `Form`
      method: options.method && options.method.toLowerCase()
    });

    const matchingMock = mocks.find(m => {
      const match = normalize(m[0]);
      const report = matches(incoming, match);

      return report.result;
    });

    if (matchingMock) {
      const resOpts = matchingMock[1];

      let body;
      let contentType;

      if (resOpts.json) {
        const json = typeof resOpts.json === 'function' ? resOpts.json() : resOpts.json;
        body = JSON.stringify(json);
        contentType = 'application/json';
      } else if (resOpts.text) {
        body = typeof resOpts.text === 'function' ? resOpts.text() : resOpts.text;
        contentType = 'text/plain; charset=UTF-8';
      }

      const headers = {};

      if (contentType) {
        headers['content-type'] = contentType;
      }

      const init = {
        status: resOpts.status || 200,
        headers
      };

      const res = new Response(body, init);

      // TODO: Support latency.
      return Promise.resolve(res);
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

    return originalFetch(url, newOptions);
  };

  if (!noPolyfill) {
    global.fetch = mockyeahFetch;
  }

  const api = {
    fetch: mockyeahFetch,
    mock,
    ...methods
  };

  return api;
};

export default Mockyeah;
