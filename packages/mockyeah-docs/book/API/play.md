# `play()`

`mockyeah.play([suite name])`

`suite name` (`String`; required) Directory name from which to mount contained
service suites (i.e. `./mockyeah/[suite name]`).

Mounts each service suite. Each suite will be mounted with the
exact same payload, headers, status, and latency as suited during its recording.
This behavior may be changed by altering the values in the suite files.

Here is an example of a service suite file:

```json
{
  "method": "GET",
  "url": "http://example.com/some/service",
  "path": "/some/service",
  "options": {
    "headers": {
      "x-powered-by": "Express",
      "content-type": "text/plain; charset=utf-8",
      "content-length": "12",
      "etag": "W/\"5-iwTV43ddKY54RV78XKQE1Q\"",
      "date": "Sun, 21 Feb 2016 06:17:49 GMT",
      "connection": "close"
    },
    "status": 200,
    "raw": "Hello world!",
    "latency": 57
  }
}
```
