# `play()`

`mockyeah.play(suiteName)`

`suiteName` (`String|String[]`; required) Suite name(s) to mount.

Mounts the specified suite in the suites directory (e.g., `./mockyeah/mySuite/index.js`).
This behavior may be changed by altering the values in the suite files.

You can also pass an array of suite names, or a single string with comma-separated list of suite names, e.g.:

```js
mockyeah.play("some-custom-suite,some-custom-suite-2");
```

or:

```js
mockyeah.play(["some-custom-suite", "some-custom-suite-2"]);
```

Or on the CLI, comma-separated:

```console
$ mockyeah play some-custom-suite,some-custom-suite-2
```

or space-separated:

```console
$ mockyeah play some-custom-suite some-custom-suite-2
```

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
