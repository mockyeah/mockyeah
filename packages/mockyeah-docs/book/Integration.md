# Integration

To integrate mockyeah with apps or tests, you can use the `mockyeah-fetch` package. This can be used in place of apps that don't have complex configuration mechanisms or control over re-wiring all their code to use URLs with the mockyeah server prefix.

It monkeypatches the `fetch` API to route requests through the mockyeah proxy.

This is supported in both browser and Node environments with `fetch` support (native or polyfilled).
Recommended polyfills are `whatwg-fetch` for browser and `node-fetch` for Node,
or `isomorhpic-fetch` for both.

In a browser, for [dynamic suites](./Suites/Dynamic.md),
it will also pass any `mockyeahSuite` cookie value as a `x-mockyeah-suite` header,
since setting a cookie is often easier than setting a header.

To use, simply:

```console
$ npm add --save-dev mockyeah-fetch
```

Then:

```js
import 'whatwg-fetch';
import 'mockyeah-fetch';

// ...
```

Or, with some options overrides (defaults below):

```js
import 'whatwg-fetch';
import proxy from 'mockyeah-fetch/proxy';

proxy({
  serverUrl: 'http://localhost:4001',
  suiteHeader: 'x-mockyeah-suite',
  suiteCookie: 'mockyeahSuite'
});

// ...
```
