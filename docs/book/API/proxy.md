# `proxy()`

`mockyeah.proxy()`

Starts a proxy that will transparently forward all non-matching requests onto their original URL.

This enables working with real APIs by default but partially mocking responses for some requests.

Then you can hit your mockyeah server's URLs like:

* `https://localhost:4001/https://api.example.com?foo=bar`
* `https://localhost:4001/https://service.example.com/foo/bar`

and allow the first to pass through to the actual origin by not defining any mocks, but mock the second with:

```js
mockyeah.get('https://service.example.com/foo/bar', {
  json: {
    hello: 'there'
  }
});
```

Internally, this mounts with a leading slash, i.e., `'/https://service.example.com/foo/bar'`.
