# Configuration

## Default configuration:

```json
{
  "name": "mockyeah",
  "host": "localhost",
  "port": 4001,
  "fixturesDir": "./fixtures",
  "capturesDir": "./mockyeah",
  "output": true,
  "journal": false,
  "verbose": false,
  "proxy": false,
  "record": false,
  "adminServer": true,
  "adminHost": "localhost",
  "adminPort": 4777
}
```

The default configuration may be overridden by placing a `.mockyeah` file in root of
your project and adding the key value pair that you wish to change. The file should
be written using standard `JSON`.

### Options:

- `name`: Used to identify the origin of logged output.
- `host`: Host on which mockyeah will run.
- `port`: Port on which mockyeah will run over HTTP (or use `portHttps`).
- `portHttps`: Port on which mockyeah will run over HTTPS (instead of `port`).
- `httpsKeyPath`: Optional file path to SSL key for custom certificates (instead of auto-generated).
- `httpsCertPath`: Optional file path to SSL key for custom certificates (instead of auto-generated)
- `fixturesDir`: Relative path to the fixtures directory.
- `capturesDir`: Relative path to the captures directory.
- `output`: Boolean to toggle mockyeah generated output written to `stdout`.
- `journal`: Boolean to toggle request journaling. Example journaling output:

  ```shell
  [mockyeah][14:54:21][REQUEST][JOURNAL] {
    "callCount": 1,
    "url": "/foo?bar=baa",
    "fullUrl": "http://localhost:4001/foo?bar=baa",
    "clientIp": "127.0.0.1",
    "method": "GET",
    "headers": {
      "host": "localhost:4001",
      "user-agent": "curl/7.43.0",
      "accept": "*/*"
    },
    "query": {
      "bar": "baa"
    },
    "body": {}
  }
  ```

- `verbose`: Boolean to toggle verbosity of mockyeah generated output.
- `proxy`: Boolean to enable a proxy on startup.

The proxy will transparently forward all non-matching requests onto their original URL.

This enables working with real APIs by default but partially mocking responses for some requests.

Then you can hit your mockyeah server's URLs like:
`https://localhost:4001/https://api.example.com?foo=bar`
`https://localhost:4001/https://service.example.com/foo/bar`

and allow the first to pass through to the actual origin by not defining any mocks, but mock the second with:

```js
mockyeah.get('https://service.example.com/foo/bar', {
  json: {
    hello: 'there'
  }
});
```

Internally, this mounts with a leading slash, i.e., `'/https://service.example.com/foo/bar'`.

- `record`: Boolean to enable recording on startup.
- `adminServer`: Boolean to enable admin server (for recording, playing, etc.)
- `adminHost`: Host on which admin server will run.
- `adminPort`: Port on which admin server will run.

### HTTPS

For HTTPS support, use the `portHttps` option. By default, this uses `create-cert-files` (based on `selfsigned`, used by `webpack-dev-server`, etc.),
where it will initially auto-generate a self-signed cert within `node_modules` then continue to re-use that as long as it exists.
Alternatively, to provide your own, you can pass config options httpsKeyPath and httpsCertPath relative to `.mockyeah`/`MOCKYEAH_ROOT`.
