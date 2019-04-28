# `play()`

`mockyeah.play(suiteName)`

`suiteName` (`String`; required) Directory name from which to mount contained
service suites (i.e. `./mockyeah/suiteName`).

Mounts the specified suite.
This behavior may be changed by altering the values in the suite files.

Here is an example of a suite file:

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
