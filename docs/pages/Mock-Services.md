# API: Mock Services

## mockyeah.\[get, put, post, delete, all\](path, options)

Example:

```js
mockyeah.get('/say-hello', { text: 'hello' });
```

Each method creates a mock service with a HTTP verb matching its respective method name.

### Parameters

#### Path `String`

Path to which to mount service. Fully supports all Express path matching options.

#### Options `Object`

Response options informing mockyeah how to respond to matching requests. Supported options:

**One of the following options may be used per service:**

* `filePath` (`String`; optional) - File with contents to include in response body. Assumes response Content-Type of file type.
* `fixture` (`String`; optional) - Fixture file with contents to include in response body. Assumes response Content-Type of file type. Default fixture file location is `./fixtures` in your project.
* `html` (`String`; optional) - HTML to include in response body. Assumes response Content-Type of `text/html`.
* `json` (`Object`; optional) - JSON to include in response body. Assumes response Content-Type of `application/json`.
* `raw` (`String`; optional) - Text to include in response body. Content-Type is the default Express type if not specified in header.
* `text` (`String`; optional) - Text to include in response body. Assumes response Content-Type of `text/plain`.

**Additional options:**

* `headers` (`Object`; optional) - Header key value pairs to include in response.
* `latency` (`Number` in Milliseconds; optional) - Used to control the response timing of a response.
* `type` (`String`; optional) - Content-Type HTTP header to return with response. Proxies option to Express response method `res.type(type)`; more info here: http://expressjs.com/en/4x/api.html#res.type
* `status` (`String`; optional; default: `200`) - HTTP response status code.
