# API: Mock Expectations

The Expectation API enables you to verify your integration via the perspective of mockyeah. Chaining `.expect()` with any number of supported expectations returns an expectation object that can be verified at the end of your test.

Example:

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
      .expect(200, () => {
        expectation.verify();
        done();
      });
  });
});
```

`.expect()` - Returns an expectation object for a given mock service when chained to a [[Mock Services API|Mock Services]] method call.

`.atLeast(Number)` - Adds expectation that a service must be called at least a specified number of times.

`.atMost(Number)` - Adds expectation that a service must be called at most a specified number of times.

`.never()` - Adds expectation that a service must never be called.

`.once()` - Adds expectation that a service must be called only once.

`.twice()` - Adds expectation that a service must be called only twice.

`.thrice()` - Adds expectation that a service must be called only thrice.

`.exactly(Number)` - Adds expectation that a service must be called exactly a specified number of times.

`.header(Key, Value)` - Adds expectation that a service must receive only requests with headers matching those specified.

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .header('host', 'example.com');
```

`.params(Object)` - Adds expectation that a service must receive only requests with query params matching those specified.

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .params({
    id: '9999'
  });
```

`.body(Object)` - Adds expectation that a service must receive only requests with bodies matching the body specified.

```js
const expectation = mockyeah
  .get('/say-hello', { text: 'hello' })
  .expect()
  .body({
    foo: 'bar'
  });
```

`.verify()` - Asserts expectation to be correct.

```js
expectation.verify();
```
