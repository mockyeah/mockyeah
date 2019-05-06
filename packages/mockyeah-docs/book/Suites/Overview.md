# Suites Overview

mockyeah provides the ability to capture request/responses and play them back later as mock services.
While recording, mockyeah proxies all received requests to configured hosts and captures their responses.
Suites include: response body, method, headers, status code, latency, and path.

See [`record`](../API/record.md), [`recordStop`](../API/recordStop.md), and [`play`](../API/play.md).

See also our section on the [CLI](../CLI/CLI.md)
for another way to record and play.

## Ad Hoc Suites

Suites can be created manually. This can ease the repetitive setup of multiple
services. Here are the steps to creating ad hoc suites:

1. Create a suite directory (e.g. `./mockyeah/suite-example`)

2. Add one or more files containing, at minimum, the following:

```json
module.exports = [
  [
    "/some/service",
    {
      "text": "Hello world!"
    }
  ]
];
```

3. Play your ad hoc suites.

```js
require('mockyeah').play('suite-example');
```

Or play all:

```js
require('mockyeah').playAll();
```

That's it!
