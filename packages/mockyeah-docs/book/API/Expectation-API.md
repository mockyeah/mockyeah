# Mock Expectations

The Expectation API enables you to verify your integration via the perspective of mockyeah. Chaining `.expect()` with any number of supported expectations returns an expectation object that can be verified at the end of your test.

Example:

```js
const mockyeah = require("mockyeah");
const request = require("supertest");

describe("This test", () => {
  it("should verify service is called once with parameter", done => {
    const expectation = mockyeah
      .get("/say-hello", { text: "hello" })
      .expect()
      .params({
        foo: "bar"
      })
      .once();

    request("http://localhost:4040")
      .get("/say-hello?foo=bar")
      .expect(200, () => {
        expectation.verify(done);
      });
  });
});
```

<div id="expect"></div>

`.expect(optionalPredicateOrMatchObject)` -
Returns an expectation object for a given mock service when chained to a [Mock Services API](./Mock-API.md) method call.
If provided an optional predicate function, it will call this function when `.verify()` is called.
In this function we can throw errors or return true/false to make assertions.
It receives one argument - an object with the following fields:

- `method` (String): the request method (lowercase).
- `path` (String): the request path.
- `query` (Object): a key/value map of query parameters.
- `headers` (Object): a key/value map of headers. Header names are all lowercase.
- `body` (Object|String): the parsed response body. If JSON, then a JS objec, otherwise a string.
- `req` (Object): the raw Express request object for additional custom assertions.

```js
const { expect } = reuqire("chai");

const expectation = mockyeah
  .post("/foo", {
    text: "bar"
  })
  .expect(data => {
    expect(data.method).to.equal("post");
    expect(data.path).to.equal("/foo");
    expect(data.query.id).to.equal("9999");
    expect(data.headers.host).to.equal("example.com");
    expect(data.body.foo).to.equal("bar");
    expect(data.req.originalUrl).to.equal("/foo?id=9999");
  });
```

If instead an object is provided, it is a match object with the same power as when mounting mocks.
It will deep partial match against a view into the request that has the fields above (except `req`),
and supports matching with string equality, number stringification, regular expressions, functions, etc.

```js
const expectation = mockyeah
  .post("/foo", {
    text: "bar"
  })
  .expect({
    method: "post",
    path: "/foo",
    query: {
      id: /99/,
      int: 3
    },
    headers: value => value.host.includes("example"),
    body: {
      foo: "bar"
    }
  });
```

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

<div id="body"></div>

`.body(Object)` - Adds expectation that a service must receive only requests with bodies matching the body specified.

```js
const expectation = mockyeah
  .get("/say-hello", { text: "hello" })
  .expect()
  .body({
    foo: "bar"
  });
```

<div id="params"></div>

`.params(Object)` - Adds expectation that a service must receive only requests with query params matching those specified.

```js
const expectation = mockyeah
  .get("/say-hello", { text: "hello" })
  .expect()
  .params({
    id: "9999"
  });
```

<div id="query"></div>

`.query(Object)` - An alias of <a href="#params">`.params(Object)`</a>.

<div id="header"></div>

`.header(key, value)` - Adds expectation that a service must receive only requests with headers matching those specified.

```js
const expectation = mockyeah
  .get("/say-hello", { text: "hello" })
  .expect()
  .header("host", "example.com");
```

<div id="after"></div>

`.run(functionOrPromise)` - This will schedule a call to `.verify()`, e.g., after a network call.
Pass a function which will be called with an argument that is a Node-style callback function reference
to be executed by you when you're ready for `.verify()` to be called.
Or pass a promise, which mockyeah will wait for to be settled until calling `.verify()`.
Or pass a function that returns a promise, with the same effect.
This is a fluent shorthand so you don't have to assign to an intermediary variable, e.g., `expectation`
just to be able to call `verify()` later.

```js
mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .params({
    id: "9999"
  })
  .once()
  .run(cb => request.get("/foo?id=9999").end(cb))
  .done(done);
```

<div id="done"></div>

`.done(callback)` - Register a Node-style callback to be called when verification has completed
after `.verify()` is called, e.g., manually or by having registered with `.run()`.
Any verification error will be passed to the callback. This is useful for async unit tests.

<div id="verify"></div>

`.verify(callback)` - Asserts expectation to be correct, and if optional callback is provided, using that to pass up assertion errors instead of throwing inline.

```js
expectation.verify();
```

The `body`, `params`, and `header` methods also accept a function instead of an object, for custom validations.
These functions receive as a first parameter the parsed body, query parameters object, or header value, respectively,
and should return `true` to indicate a pass, or return `false` or throw an error (like many assertion libraries) to indicate a failure.

Examples:

```js
const expectation = mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .header("X-API-Key", value => /[0-9A-F]{32}/i.test(value));
```

```js
const { expect } = require("chai");

const expectation = mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .params(params =>
    expect(params).to.equal({
      some: "value"
    })
  );
```

```js
const expectation = mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .params(params => params.someParam === "yes");
```

```js
const expectation = mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .body(body => body.id === "123");
```
