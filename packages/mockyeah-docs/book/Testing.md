# Testing

To ease setup & use for popular unit test frameworks, mockyeah maintains some packages.

## Jest

If you're using the [Jest](https://jestjs.io) unit test framework, try our `mockyeah-test-jest` package to ease setup & use.

All you need to do is:

```console
$ npm add --only=dev mockyeah-test-jest
```

Then, in your test files:

```js
import mockyeah from 'mockyeah-test-jest';

describe('test', () => {
  it('should work', () => {
    mockyeah.get('/');
  });
});
```
