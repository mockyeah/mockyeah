# `play()`

`mockyeah.play([suite name])`

`suite name` (`String`; required) Directory name from which to mount contained
service suites (i.e. `./mockyeah/[suite name]`).

Mounts each service suite. Each suite will be mounted with the
exact same payload, headers, status, and latency as suited during its recording.
This behavior may be changed by altering the values in the suite files.

Here is an example of a service suite file:

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
