---
title: Integration
---

# Integration

To integrate mockyeah with apps or tests, you can use the `@mockyeah/fetch` package.

This can monkeypatch the native `fetch` API to enable some mockyeah features. It is supported in both browser and Node environments with `fetch` support (native or polyfilled). Recommended polyfills are `whatwg-fetch` for browser and `node-fetch` for Node, or `isomorhpic-fetch` for both.

## Proxy

The `proxy` option adds the mockyeah server URL prefix to all URLs requested with `fetch` in the browser via a monkeypatch. It can be used place of apps that don't have complex configuration mechanisms or control over re-wiring all their code to use URLs with the mockyeah server URL prefix.

In a browser, for [dynamic suites](Suites/Dynamic),
it will also pass any `mockyeahSuite` cookie value as a `x-mockyeah-suite` header,
since setting a cookie is often easier for users than setting a header.

To use, simply:

```console
$ npm add @mockyeah/fetch
```

Then:

```js
import 'isomorhpic-fetch';
import Mockyeah from '@mockyeah/fetch';

new Mockyeah();
```

The `Mockyeah` constructor also supports options. See `BootOptions` in the [TypeScript types file][types].

## Client-side mocking

The `@mockyeah/fetch` library also supports client-side mocking, which can intercept
requests with mocks to bypass a network call entirely.
For some use cases, this can have a number of advantages over
the mockyeah server, including:

- faster responses with no networking round-trip latency
- more deterministic unit tests
- simplified infrastructure for integration in higher environments
- ability to inject code into app during automated functional regression tests over the
  WebDriver protocol, such as with Selenium, etc.

```js
import 'isomorhpic-fetch';
import Mockyeah from '@mockyeah/fetch';

const mockyeah = new Mockyeah();

mockyeah.mock('https://example.local?ok=yes', {
  json: { fake: 'response' }
});

mockyeah.post(
  {
    url: 'https://example.local?ok=true',
    body: {
      up: 'yes'
    }
  },
  {
    json: () => ({ hello: 'there' })
  }
);
```

The `mockyeah` object has these properties (see [types] for more detail):

```ts
{
  fetch: (url: string, fetchOptions?: {}, mockyeahFetchOptions?: MockyeahFetchOptions)
    => Promise<Response>,
  mock: (match: MatchObject, options?: ResponseOptions ) => void,
  all: (match: MatchObject, option?s: ResponseOptions ) => void,
  get: (match: MatchObject, options?: ResponseOptions ) => void,
  post: (match: MatchObject, options?: ResponseOptions ) => void,
  put: (match: MatchObject, options?: ResponseOptions ) => void,
  delete: (match: MatchObject, options?: ResponseOptions ) => void,
  options: (match: MatchObject, options?: ResponseOptions ) => void,
  patch: (match: MatchObject, options?: ResponseOptions ) => void
}
```

[types]: https://github.com/mockyeah/mockyeah/blob/master/packages/mockyeah-fetch/src/types.ts
