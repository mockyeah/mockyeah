---
title: Mock | API
---

# Mock API

`get/post/put/patch/delete/all(match, options)`

Each method creates a mock service with a HTTP verb matching its respective method name.

## Match

<div id="parameters"></div>

### `match` Request Match

Specifies how to match requests to this mock.

In the simplest case, it can be a string specifying the `path` to match.

We support [Express route path matching options](https://expressjs.com/en/guide/routing.html#route-paths).

But you can also include query parameters as a shorthand for `query` below.

Examples:

```js
mockyeah.get('/say-hello', { text: 'hello' });

mockyeah.get('/say-hello?to=someone', { text: 'hello, someone' });

// Or used named parameters for wildcard matching.
mockyeah.get('/say-hello/:person', { text: 'hello, person' });

// Or drop into regular expression with '()':
mockyeah.get('/say-(.*)', { text: 'something, someone' });

// Or regex path match:
mockyeah.get(/say-[a-z]+/, { text: 'something, someone' });

// Or to match any path, use just a wildcard:
mockyeah.get('*', { text: 'anything, anyone' });
```

If you want the mock to match only for specific headers, query parameters, or request body,
or use some of the more advanced matching features like regular expressions or functions
in place of string matches, then you can use the object syntax.
Values within the object can be strings, regular expressions,
functions, or plain objects. See [Match Values](Match-Values).

All keys but `path` (also aliased as `url`) are optional.

Its structure is:

<!-- prettier-ignore -->
```js
{
  path?: MatchValue,
  url?: MatchValue,
  query?: MatchValue
  headers?: MatchValue
  body?: MatchValue,
  method?: MatchValue
}
```

with types:

<!-- prettier-ignore -->
```js
type MatchValue = string | RegExp | (string) => boolean | MatchBody;

type MatchBody = {
  [key: string]: MatchValue
};
```

If using query parameters in both the `path`/`url` and in a `query` object, then the key/value
pairs are merged, with the values in `query` taking precedence.

### Methods

If using `.all` with the object syntax, you may use a `method` key to match only a specific method anyway.
This may ease programmatic use, e.g., wiring up mocks from a declarative definition.
Supports any casing. Recommended values include:

`'get' | 'post' | 'put' | 'patch' | 'delete' | 'all'`

Examples:

```js
mockyeah.post(
  {
    path: '/say-hello',
    headers: {
      'X-API-Key': /[0-9A-F]{32}/i
    },
    body: {
      to: 'friend'
    }
  },
  { text: 'hello, friend' }
);
```

```js
mockyeah.all(
  {
    path: '/say-hello',
    method: 'get'
  },
  { text: 'hello, friend' }
);
```

### Shorthands

You can also mount an empty HTTP 200 response by not providing response options:

```js
mockyeah.get('/hey');
```

which is shorthand for:

```js
mockyeah.get('/hey', {});
```

Or an HTTP 200 repsonse with text body by providing a string instead of object options:

```js
mockyeah.get('/hey', 'why hello');
```

which is shorthand for:

```js
mockyeah.get('/hey', { text: 'why hello' });
```

<div id="options"></div>

### `options` Response Options (optional `Object|String`)

Response options informing mockyeah how to respond to matching requests. Supported options:

**One of the following options may be used per service:**

- `filePath` (`String`; optional) - File with contents to include in response body. Assumes response Content-Type of file type.
- `fixture` (`String`; optional) - Fixture file with contents to include in response body. Assumes response Content-Type of file type. Default fixture file location is `./fixtures` in your project.

- `html` (`String|Function|Promise`; optional) - HTML to include in response body. Assumes response Content-Type of `text/html`.
- `json` (`Object|Function|Promise`; optional) - JSON to include in response body. Assumes response Content-Type of `application/json`.
- `raw` (`String|Function|Promise`; optional) - Text to include in response body. Content-Type is the default Express type if not specified in header.
- `text` (`String|Function|Promise`; optional) - Text to include in response body. Assumes response Content-Type of `text/plain`.

For dynamic behavior, the noted methods above can also be defined as functions that return response body values.
For asynchronous behavior, they can be defined as promises that resolve with such values, or a functions that return such promises.
The functions will receive the [Express request object](https://expressjs.com/en/api.html#req) as a first and only argument.

Examples:

```js
mockyeah.get('/service/exists', { json: req => ({ hello: req.query.name }) });
```

```js
mockyeah.get('/service/exists', {
  json: req => Promise.resolve({ hello: req.query.name })
});
```

```js
mockyeah.get('/service/exists', { json: Promise.resolve({ hello: 'there' }) });
```

**Additional options:**

- `headers` (`Object`; optional) - Header key value pairs to include in response.
- `latency` (`Number` in Milliseconds; optional) - Used to control the response timing of a response.
- `type` (`String`; optional) - Content-Type HTTP header to return with response. Proxies option to Express response method `res.type(type)`; more info here: http://expressjs.com/en/4x/api.html#res.type
- `status` (`String`; optional; default: `200`) - HTTP response status code.
