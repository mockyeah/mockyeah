# @mockyeah/test-server-jest

[Jest](https://jestjs.io) unit test setup for [mockyeah](https://github.com/mockyeah/mockyeah) server,
a powerful service mocking, recording, and playback utility.

<img src="https://raw.githubusercontent.com/mockyeah/mockyeah/master/packages/mockyeah-docs/src/images/logo/mockyeah-600.png" height="200" />

[![npm](https://img.shields.io/npm/v/@mockyeah/test-server-jest.svg)](https://www.npmjs.com/package/@mockyeah/test-server-jest)

All you need to do is:

```js
import mockyeah from '@mockyeah/test-server-jest';

describe('test', () => {
  it('should work', () =>
    mockyeah
      .get('/')
      .expect()
      .once()
      .run(fetch(mockyeah.server.url))
      .verify());
});
```

## License

@mockyeah/test-server-jest is released under the [MIT License](https://opensource.org/licenses/MIT).
