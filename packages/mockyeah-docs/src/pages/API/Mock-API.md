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

Response options informing mockyeah how to respond to matching requests.

If you pass just a string as response options, that's equivalent to passing just:

```js
{
  text: 'your string';
}
```

See below for explanation of the `Responder` type.

**One of the following response body options may be used per mock:**

- `filePath` (`Responder<string>?`)
  - File with contents to include in response body. Assumes response Content-Type of file type.
- `fixture` (`Responder<string>?`)
  - Fixture file with contents to include in response body. Assumes response Content-Type of file type. Default fixture file location is `./fixtures` in your project.
- `html` (`Responder<string>?`)
  - HTML to include in response body. Defaults to `Content-Type` of `text/html`.
- `json` (`Responder<Record<string, any>>?`)
  - JSON to include in response body. Defaults to `Content-Type` of `application/json`.
- `raw` (`Responder<any>?`)
  - Content to include in response body. `Content-Type` is default if not specified in `type` or `headers`.
- `text` (`Responder<string>?`)
  - Text to include in response body. Defaults to `Content-Type` of `text/plain`.

For dynamic behavior, most methods can optionally be defined as functions that return the properly typed values.
For asynchronous behavior, they can be defined as promises that resolve with such values, or a functions that return such promises. So the type is:

```ts
type Responder<T> = T | ((req?, res?) => T) | ((req?, res?) => Promise<T>) | Promise<T>;
```

The functions will receive a `req` argument with this structure:

```ts
interface Req {
  url: string;
  path?: string; // Alias of `url`.
  method?: string; // Lowercase.
  query?: Record<string, string>;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  body?: string | Record<string, any> | any; // Text or JSON or raw.
}
```

If you wish, mockyeah can also internally fetch and give you the actual response,
which you can then manipulate or derive a mock response.
You can enable this behavior by adding a 2nd `res` argument to your
response option functions:

```ts
interface Res {
  status?: number;
  headers?: Record<string, string>;
  body?: string | Record<string, any> | any; // Text or JSON or raw.
}
```

Examples of dynamic responses:

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

```js
mockyeah.get('https://httpbin.org/json', {
  json: (req, res) => ({
    ...(res && res.body),
    other: 'whatever'
  })
});
```

```js
mockyeah.get('https://httpbin.org/html', {
  text: (req, res) => res.body.replace(/<h1/g, '<h2').toUpperCase()
});
```

**Additional options:**

These (as above) can also be functions, promises, or functions that return promises.

- `headers` (`Responder<Record<string, string>>?`)
  - Header key value pairs to include in response.
- `latency` (`Responder<number>?`)
  - In milliseconds, used to control the response timing of a response.
- `type` (`Responder<string>?`)
  - Override the `Content-Type` HTTP header sent with the response. Also maps from file extensions via [`mime.getType(type)`](https://www.npmjs.com/package/mime#mimegettypepathorextension).
- `status` (`Responder<string>?`)
  - HTTP response status code. Default `200`.
