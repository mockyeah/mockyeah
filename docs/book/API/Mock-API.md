# Mock API

`get/post/put/patch/delete/all(match, options)`

Each method creates a mock service with a HTTP verb matching its respective method name.

## Parameters

<div id="match"></div>
### `match` Request Match (`String` or `Object`)

Specifies how to match requests to this mock.
In the simplest case, it can be a string specifying the `path` to match.
The can include query parameters as a shorthand for `query` below.
This fully supports all Express path matching options.

Examples:

```js
mockyeah.get('/say-hello', { text: 'hello' });

mockyeah.get('/say-hello/:person', { text: 'hello, person' });

mockyeah.get('/say-hello?to=someone', { text: 'hello, someone' });
```

If you want the mock to match only for specific headers, query parameters, or request body,
or use some of the more advanced matching features like regular expressions or functions,
then use the object syntax. All keys but `path` are optional. Its structure is:

<!-- prettier-ignore -->
```js
{
  path: string,
  query?: {
    [name: string]: MatchString
  },
  headers?: {
    [name: string]: MatchString
  },
  body?: MatchBody
}
```

with types:

<!-- prettier-ignore -->
```js
type MatchString = string | RegExp | (string) => boolean;

type MatchBody = {
  [key: string]: MatchBody | MatchString | mixed
};
```

Body matching is currently only supported for JSON payloads.

Objects like `headers` and `body` can be partial, deep object matches - they do not need to match the entire set of headers or the entire body of the request.

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

<div id="options"></div>
### `options` Response Options (`Object`)

Response options informing mockyeah how to respond to matching requests. Supported options:

**One of the following options may be used per service:**

* `filePath` (`String`; optional) - File with contents to include in response body. Assumes response Content-Type of file type.
* `fixture` (`String`; optional) - Fixture file with contents to include in response body. Assumes response Content-Type of file type. Default fixture file location is `./fixtures` in your project.

* `html` (`String|Function|Promise`; optional) - HTML to include in response body. Assumes response Content-Type of `text/html`.
* `json` (`Object|Function|Promise`; optional) - JSON to include in response body. Assumes response Content-Type of `application/json`.
* `raw` (`String|Function|Promise`; optional) - Text to include in response body. Content-Type is the default Express type if not specified in header.
* `text` (`String|Function|Promise`; optional) - Text to include in response body. Assumes response Content-Type of `text/plain`.

For dynamic behavior, the noted methods above can also be defined as functions that return response body values.
For asynchronous behavior, they can be defined as promises that resolve with such values, or a functions that return such promises.
The functions will receive the Express request object as a first and only argument.

Examples:

```js
mockyeah.get('/service/exists', { json: req => ({ hello: req.query.name }) });
```

```js
mockyeah.get('/service/exists', { json: req => Promise.resolve({ hello: req.query.name }) });
```

```js
mockyeah.get('/service/exists', { json: Promise.resolve({ hello: 'there' }) });
```

**Additional options:**

* `headers` (`Object`; optional) - Header key value pairs to include in response.
* `latency` (`Number` in Milliseconds; optional) - Used to control the response timing of a response.
* `type` (`String`; optional) - Content-Type HTTP header to return with response. Proxies option to Express response method `res.type(type)`; more info here: http://expressjs.com/en/4x/api.html#res.type
* `status` (`String`; optional; default: `200`) - HTTP response status code.
