# `play()`

`mockyeah.play([snapshot name])`

`snapshot name` (`String`; required) Directory name from which to mount contained
service snapshots (i.e. `./mockyeah/[snapshot name]`).

Mounts each service snapshot. Each snapshot will be mounted with the
exact same payload, headers, status, and latency as captured during its recording.
This behavior may be changed by altering the values in the snapshot files.

Here is an example of a service snapshot file:

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
