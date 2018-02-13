# API: Service Snapshots

mockyeah provides the ability to capture service snapshots from real services and playing them back later as mock services.
While recording, mockyeah proxies all received requests to configured hosts and captures their responses as snapshots.
Snapshots include: response body, method, headers, status code, latency, and path.

## mockyeah.record([snapshot name])

`snapshot name` (`String`; required) Directory name to save service snapshots
(i.e. `./mockyeah/[snapshot name]`).

Configures mockyeah to proxy and capture service requests. Recorded responses
are written to `./mockyeah`. To use this feature, you must update
the service addresses in your application to proxy through mockyeah. Here is an
example of an address configured for recording:

```
http://localhost:[mockyeah port]/http://example.com/your/service/url
```

The above URL looks pretty crazy, but rest assured it works and eliminates the need for a system level proxy.

## mockyeah.play([snapshot name])

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

## Ad hoc snapshots

Snapshots can be created manually. This can ease the repetitive setup of multiple
services. Here are the steps to creating ad hoc snapshots:

1. Create a snapshot directory (e.g. `./mockyeah/snapshot-example`)
2. Add one or more JSON files containing, at minimum, the following properties:

```json
{
  "method": "GET",
  "path": "/some/service",
  "options": {
    "text": "Hello world!"
  }
}
```

3. Play your ad hoc snapshots.

```js
require('mockyeah').play('snapshot-example');
```

4. That's it!
