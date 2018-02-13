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
  "verbose": false
}
```

The default configuration may be overridden by placing a `.mockyeah` file in root of
your project and adding the key value pair that you wish to change. The file should
be written using standard `JSON`.

### Options:

* `name`: Used to identify the origin of logged output.
* `host`: Host on which mockyeah will run.
* `port`: Port on which mockyeah will run.
* `fixturesDir`: Relative path to the fixtures directory.
* `capturesDir`: Relative path to the captures directory.
* `output`: Boolean to toggle mockyeah generated output written to stdout.
* `journal`: Boolean to toggle request journaling. Example journaling output:

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

* `verbose`: Boolean to toggle verbosity of mockyeah generated output.
