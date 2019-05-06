# mockyeah-fetch

**Part of mockyeah, a powerful service mocking, recording, and playback utility.**

<img src="../../packages/mockyeah-docs/book/logo/mockyeah.png" height="200" />

[![npm](https://img.shields.io/npm/v/mockyeah-fetch.svg)](https://www.npmjs.com/package/mockyeah-fetch)

Simply:

```js
import 'whatwg-fetch';
import { proxy } from 'mockyeah-fetch';

proxy();
```

or with some options (defaults below):

```js
proxy({
  serverUrl: 'http://localhost:4001',
  suiteHeader: 'x-mockyeah-suite',
  suiteCookie: 'mockyeahSuite'
});
```

More at **https://mockyeah.js.org**.

## License

mockyeah is released under the [MIT License](https://opensource.org/licenses/MIT).
