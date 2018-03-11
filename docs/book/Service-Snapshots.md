# Service Snapshots

mockyeah provides the ability to capture service snapshots from real services and playing them back later as mock services.
While recording, mockyeah proxies all received requests to configured hosts and captures their responses as snapshots.
Snapshots include: response body, method, headers, status code, latency, and path.

See [`record`](API/record.md) and [`play`](API/play.md).

## Ad hoc snapshots

Snapshots can be created manually. This can ease the repetitive setup of multiple
services. Here are the steps to creating ad hoc snapshots:

1.  Create a snapshot directory (e.g. `./mockyeah/snapshot-example`)
2.  Add one or more JSON files containing, at minimum, the following properties:

```json
{
  "method": "GET",
  "path": "/some/service",
  "options": {
    "text": "Hello world!"
  }
}
```

3.  Play your ad hoc snapshots.

```js
require('mockyeah').play('snapshot-example');
```

4.  That's it!
