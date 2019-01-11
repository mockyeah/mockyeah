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
`.expect()` - Returns an expectation object for a given mock service when chained to a [Mock Services API](./Mock-API.md) method call.

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

<div id="header"></div>
`.header(Key, Value)` - Adds expectation that a service must receive only requests with headers matching those specified.

```js
const expectation = mockyeah
  .get("/say-hello", { text: "hello" })
  .expect()
  .header("host", "example.com");
```

<div id="verify"></div>
`.verify(callback)` - Asserts expectation to be correct, and if optional callback is provided, using that to pass up assertion errors instead of throwing inline.

```js
expectation.verify();
```

The `body`, `params`, and `header` methods also accept a function instead of an object, for custom validations.
These functions receive as a first parameter the parsed body, query parameters object, or header value, respectively,
and should return `true` or `false` to indicate a pass or failure of the expectation.

Examples:

```js
const expectation = mockyeah
  .get("/foo", { text: "bar" })
  .expect()
  .header("X-API-Key", value => /[0-9A-F]{32}/i.test(value));
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
