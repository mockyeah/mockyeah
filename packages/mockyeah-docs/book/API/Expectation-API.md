# Mock Expectations

The Expectation API enables you to verify your integration via the perspective of mockyeah. Chaining `.expect()` with any number of supported expectation functions returns an expectation object that can be verified at the end of your test. There are [quantitative](#quantitative), [structural](#structural),
and other expectation functions.

Example:

```js
const mockyeah = require('mockyeah');
const request = require('supertest');

describe('This test', () => {
  it('should verify service is called once with parameter', () =>
    mockyeah
      .expect({
        method: 'get',
        path: '/say-hello',
        query: {
          foo: 'bar'
        }
      })
      .once()
      .run(() => request('http://localhost:4001').get('/say-hello?foo=bar'))
      .verify());
});
```

If you would prefer to use the [Mock API](./Mock-API.md) methods to setup endpoints:

```js
const mockyeah = require('mockyeah');
const request = require('supertest');

describe('This test', () => {
  it('should verify service is called once with parameter', () =>
    mockyeah
      .get('/say-hello', { text: 'hello' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once()
      .run(() => request('http://localhost:4040').get('/say-hello?foo=bar'))
      .verify());
});
```

Or without `run`, with `verifier` call as callback:

```js
const mockyeah = require('mockyeah');
const request = require('supertest');

describe('This test', () => {
  it('should verify service is called once with parameter', done => {
    const expectation = mockyeah
      .get('/say-hello', { text: 'hello' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once();

    request('http://localhost:4040')
      .get('/say-hello?foo=bar')
      .expect(200, expectation.verifier(done));
  });
});
```

Or with `verify` instead of `verifier` (be sure handle prior errors and try/catch the call, which `verifier` does for you):

```js
const mockyeah = require('mockyeah');
const request = require('supertest');

describe('This test', () => {
  it('should verify service is called once with parameter', done => {
    const expectation = mockyeah
      .get('/say-hello', { text: 'hello' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once();

    request('http://localhost:4040')
      .get('/say-hello?foo=bar')
      .expect(200, err => {
        if (err) {
          done(err);
          return;
        }
        try {
          expectation.verify(done);
        } catch (err2) {
          done(err2);
        }
      });
  });
});
```

## Expectations

<div id="expect"></div>

`.expect(optionalPredicateOrMatchObject)` -
Returns an expectation object for a given mock service when chained
to a [Mock API](./Mock-API.md) method call.

It optionally accepts a [match value](./Match-Values.md), in this case either
an object or a function, allowing you to assert on several fields of the request at once,
as an alternative to the individual functions below like `query()`, `body()`, etc.
The match will be against an object with the following fields:

- `method` (String): the request method (lowercase).
- `path` (String): the request path.
- `query` (Object): a key/value map of query parameters.
- `headers` (Object): a key/value map of headers. Header names are all lowercase.
- `body` (Object|String): the parsed response body. If JSON, then an object, otherwise a string.
- `req` (Object): the raw Express request object for additional custom assertions.

```js
const { expect } = reuqire('chai');

const expectation = mockyeah
  .post('/foo', {
    text: 'bar'
  })
  .expect(data => {
    expect(data.method).to.equal('post');
    expect(data.path).to.equal('/foo');
    expect(data.query.id).to.equal('9999');
    expect(data.headers.host).to.equal('example.com');
    expect(data.body.foo).to.equal('bar');
    expect(data.req.originalUrl).to.equal('/foo?id=9999');
  });
```

```js
const expectation = mockyeah
  .post('/foo', {
    text: 'bar'
  })
  .expect({
    method: 'post',
    path: '/foo',
    query: {
      id: /99/,
      int: 3
    },
    headers: value => value.host.includes('example'),
    body: {
      foo: 'bar'
    }
  });
```

## Quantitative

<div id="atLeast">

`.atLeast(Number)` - Adds expectation that a service must be called at least a specified number of times.

<div id="atMost"></div>

`.atMost(Number)` - Adds expectation that a service must be called at most a specified number of times.

<div id="never"></div>

`.never()` - Adds expectation that a service must never be called.

<div id="once"></div>

`.once()` - Adds expectation that a service must be called only once.

<div id="twice"></div>

`.twice()` - Adds expectation that a service must be called only twice.

<div id="thrice"></div>

`.thrice()` - Adds expectation that a service must be called only thrice.

<div id="exactly"></div>

`.exactly(Number)` - Adds expectation that a service must be called exactly a specified number of times.

## Structural

<div id="path"></div>

`.path(MatchValue)` - Adds an expectation that a service must receive only requests with paths matching the value specified. See [match value](./Match-Values.md).

```js
const expectation = mockyeah
  .get('*')
  .expect()
  .path('/foo');
```

<div id="url"></div>

`.url(MatchValue)` - An alias of <a href="#path">`.path()`</a>.

```js
const expectation = mockyeah
  .get('*')
  .expect()
  .url('/foo');
```

<div id="body"></div>

`.body(MatchValue)` - Adds an expectation that a service must receive only requests with bodies matching the body specified. See [match value](./Match-Values.md).

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .body({
    foo: 'bar'
  });
```

<div id="params"></div>

`.params(MatchValue)` - Adds expectation that a service must receive only requests with query params matching those specified. See [match value](./Match-Values.md).

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .params({
    id: '9999'
  });
```

<div id="query"></div>

`.query(MatchValue)` - An alias of <a href="#params">`.params(Object)`</a>.

<div id="header"></div>

`.header(key, MatchValue)` - Adds expectation that a service must receive only requests with headers matching those specified. See [match value](./Match-Values.md).

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .header('host', 'example.com');
```

## Execute

<div id="run"></div>

`.run(functionOrPromise)` - This will register side effects to run
before `.verify()` logic is executed, e.g., after a network call.
Pass a function which will be called with an argument that is a Node-style callback function reference
to be executed by you when you're ready for `.verify()` to be called.
Or pass a promise, which mockyeah will wait for to be settled until calling `.verify()`.
Or pass a function that returns a promise, with the same effect.
This is a fluent shorthand so you don't have to assign to an intermediary variable, e.g., `expectation`
just to be able to call `verify()` later.

With promise:

```js
mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .params({
    id: '9999'
  })
  .once()
  .run(request.get('/foo?id=9999'))
  .verify(done);
```

Or function returning promise:

```js
mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .params({
    id: '9999'
  })
  .once()
  .run(() => request.get('/foo?id=9999'))
  .verify(done);
```

Or function calling callback:

```js
mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .params({
    id: '9999'
  })
  .once()
  .run(cb => {
    request.get('/foo?id=9999').end(cb);
  })
  .verify(done);
```

<div id="verify"></div>

`.verify(callback)` - Asserts expectation to be correct, and if optional callback is provided, using that to pass up assertion errors instead of throwing an assert error inline.
If passed a promise, or a callback returning a promise, then it will return this promise, e.g., to return to a test framework like `jest` or `mocha` supporting that.

```js
expectation.verify();
```

The `body`, `params`, and `header` methods also accept a function instead of an object, for custom validations.
These functions receive as a first parameter the parsed body, query parameters object, or header value, respectively,
and should return `true` to indicate a pass, or return `false` or throw an error (like many assertion libraries) to indicate a failure.

If `run` was called, verification will pause until the function or promise passed to `run` completes.

Also, `verify` returns a promise, which can be returned directly to test frameworks without using any `done` callbacks.

<div id="verifier"></div>

`.verifier(callback)` - Creates a callback function for you for use after any side effects under test
that bubbles any errors passed to it up to the provided callback (in the Node style),
and otherwise safely calls `.verify(callback)` internally in a `try`/`catch` and again forwarding any errors.
It's a shorthand so that you can write this:

```js
request('http://localhost:4040')
  .get('/say-hello?foo=bar')
  .expect(200, expectation.verifier(done));
```

Instead of this:

```js
request('http://localhost:4040')
  .get('/say-hello?foo=bar')
  .expect(200, err => {
    if (err) {
      done(err);
      return;
    }
    try {
      expectation.verify(done);
    } catch (err2) {
      done(err2);
    }
  });
```

<div id="examples"></div>

## Examples

```js
const expectation = mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .header('X-API-Key', value => /[0-9A-F]{32}/i.test(value));
```

```js
const { expect } = require('chai');

const expectation = mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .params(params =>
    expect(params).to.equal({
      some: 'value'
    })
  );
```

```js
const expectation = mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .params(params => params.someParam === 'yes');
```

```js
const expectation = mockyeah
  .get('/foo', { text: 'bar' })
  .expect()
  .body(body => body.id === '123');
```
