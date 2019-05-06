# mockyeah-test-jest

[Jest](https://jestjs.io) unit test setup for [mockyeah](https://github.com/mockyeah/mockyeah),
a powerful service mocking, recording, and playback utility.

<img src="https://raw.githubusercontent.com/mockyeah/mockyeah/master/packages/mockyeah-docs/book/logo/mockyeah-600.png" height="200" />

[![npm](https://img.shields.io/npm/v/mockyeah-test-jest.svg)](https://www.npmjs.com/package/mockyeah-test-jest)

All you need to do is:

```js
import mockyeah from 'mockyeah-test-jest';

describe('test', () => {
  test('should work', () => {
    mockyeah.get('/');
  });
});
```

## License

mockyeah-test-jest is released under the [MIT License](https://opensource.org/licenses/MIT).
