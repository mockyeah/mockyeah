# `play()`

`mockyeah.play([snapshot name])`

`snapshot name` (`String`; required) Directory name from which to mount contained
service snapshots (i.e. `./mockyeah/[snapshot name]`).

Mounts each service snapshot. Each snapshot will be mounted with the
exact same payload, headers, status, and latency as captured during its recording.
This behavior may be changed by altering the values in the snapshot files.

Here is an example of a service snapshot file:

```js
module.exports = [
  [
    "http://example.com/some/service",
    {
      headers: {
        "x-powered-by": "Express",
        "content-type": "text/plain; charset=utf-8",
        "content-length": "12"
      },
      status: 200,
      raw: "Hello world!",
      latency: 57
    }
  ]
];
```
