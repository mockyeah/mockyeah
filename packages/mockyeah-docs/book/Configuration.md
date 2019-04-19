# Configuration

## Default configuration:

```json
{
  "name": "mockyeah",
  "host": "localhost",
  "port": 4001,
  "fixturesDir": "./fixtures",
  "suitesDir": "./mockyeah",
  "output": true,
  "journal": false,
  "verbose": false,
  "proxy": false,
  "record": false,
  "adminServer": true,
  "adminHost": "localhost",
  "adminPort": 4777,
  "httpsCertPath": undefined,
  "httpsKeyPath": undefined,
  "recordToFixtures": true,
  "recordToFixturesMode": "path",
  "formatScript": undefined,
  "watch": false,
  "responseHeaders": true,
  "groups": {},
  "suiteHeader": "x-mockyeah-suite",
  "suiteCookie": "mockyeahSuite"
}
```

The default configuration may be overridden by placing a `.mockyeah` (or `.mockyeah.json`) JSON file in root of your project and adding the key/value pairs that you wish to change.
Also supports a `.mockyeah.js` as a Node module that exports a JavaScript object as the config.

### Options:

- `name`: Used to identify the origin of logged output.
- `host`: Host on which mockyeah will run.
- `port`: Port on which mockyeah will run over HTTP (or use `portHttps`).
- `portHttps`: Port on which mockyeah will run over HTTPS (instead of `port`).
- `httpsKeyPath`: Optional file path to SSL key for custom certificates (instead of auto-generated).
- `httpsCertPath`: Optional file path to SSL key for custom certificates (instead of auto-generated)
- `fixturesDir`: Relative path to the fixtures directory.
- `suitesDir`: Relative path to the suites directory.
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
- `suiteHeader`: String for the header name to use to opt-in to suites dynamically.
- `suiteCookie`: String for the cookie name to use to opt-in to suites dynamically.

The proxy will transparently forward all non-matching requests onto their original URL.

This enables working with real APIs by default but partially mocking responses for some requests.

Then you can hit your mockyeah server's URLs like:
`https://localhost:4001/https://api.example.com?foo=bar`
`https://localhost:4001/https://service.example.com/foo/bar`

and allow the first to pass through to the actual origin by not defining any mocks, but mock the second with:

```js
mockyeah.get("https://service.example.com/foo/bar", {
  json: {
    hello: "there"
  }
});
```

Internally, this mounts with a leading slash, i.e., `'/https://service.example.com/foo/bar'`.

- `record`: Boolean to enable recording on startup.
- `adminServer`: Boolean to enable admin server (for recording, playing, etc.)
- `adminHost`: Host on which admin server will run.
- `adminPort`: Port on which admin server will run.
- `recordToFixtures`: Whether to record suites with response bodies written to separate files in the fixtures directory vs. inlined into the suite files.
- `recordToFixturesMode`: When `recordToFixtures` is enabled, which mode to use to refer to fixture files
  - "path" (default): Use the response option of `fixture` with the path to the fixture file as a string.
  - "require": For JSON fixtures, use the response option of `json` with an inline `require` of the JSON file using a relative path, otherwise fallback to "path" mode (may support custom `require`-able files in the future for users with custom setups, e.g., Webpack loaders).
- `formatScript`: To apply custom formatting to the JS in the suite files, specify a string path to a module (relative to mockyeah root near your config file) that exports a function of the signature `(js: string) : string => {}`. Or if using programmatically rather than a JSON config file, you can provide a function as a value directly.

### HTTPS

For HTTPS support, use the `portHttps` option. By default, this uses `create-cert-files` (based on `selfsigned`, used by `webpack-dev-server`, etc.),
where it will initially auto-generate a self-signed cert within `node_modules` then continue to re-use that as long as it exists.
Alternatively, to provide your own, you can pass config options httpsKeyPath and httpsCertPath relative to `.mockyeah`/`MOCKYEAH_ROOT`.
