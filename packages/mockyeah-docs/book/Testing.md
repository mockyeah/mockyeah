# Testing

## Example

Here's an example of using mockyeah in unit tests (via the [Jest package](#jest) described below):

```js
const mockyeah = require('@mockyeah/test-jest');
const supertest = require('supertest');

const request = supertest(mockyeah.server.url);

describe('Wondrous service', () => {
  it('should create a mock service that returns an internal error', done => {
    // create failing service mock
    mockyeah.get('/wondrous', { status: 500 });

    // assert service mock is working
    request.get('/wondrous').expect(500, done);
  });

  it('should create a mock service that returns JSON', done => {
    // create service mock that returns json data
    mockyeah.get('/wondrous', { json: { foo: 'bar' } });

    // assert service mock is working
    request.get('/wondrous').expect(200, { foo: 'bar' }, done);
  });

  it('should verify a mock service expectation', () =>
    // create service mock with expectation
    mockyeah
      .get('/wondrous', { text: 'it worked' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once()
      // invoke request and verify expectation
      .run(request.get('/wondrous?foo=bar'))
      .verify());
});
```

## Test Packages

To ease setup & use for popular unit test frameworks, mockyeah maintains some packages.

### Jest

If you're using the [Jest](https://jestjs.io) unit test framework, try our `@mockyeah/test-jest` package to ease setup & use.

All you need to do is:

```console
$ npm add --save-dev @mockyeah/test-jest
```

Then, in your test files:

```js
import mockyeah from '@mockyeah/test-jest';

describe('test', () => {
  test('should work', () => {
    mockyeah.get('/');
  });
});
```

### Mocha

If you're using the [Mocha](https://mochajs.org) unit test framework, try our `@mockyeah/test-mocha` package to ease setup & use.

All you need to do is:

```console
$ npm add --save-dev @mockyeah/test-mocha
```

Then, in your test files:

```js
import mockyeah from '@mockyeah/test-mocha';

describe('test', () => {
  it('should work', () => {
    mockyeah.get('/');
  });
});
```

## Manual

You'll want to construct a server with the following options,
and wire it into before/after each/all hooks for your testing framework.

```js
const MockyeahServer = require('@mockyeah/server/server');

const mockyeah = new MockyeahServer({
  port: 0,
  adminServer: false,
  start: false,
  watch: false
});

beforeAll(() => mockyeah.start());

afterEach(() => mockyeah.reset());

afterAll(() => mockyeah.close());
```
