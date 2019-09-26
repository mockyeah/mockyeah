---
title: start | API
---

# `start()`

`mockyeah.start(callback)`

`callback` (`Function`; optional) To be exceuted when starting completes.
Passed an error as first argument if the closing fails. Also returns a promise.

Starts the mockyeah server - to be used in combination with `start: false` in [configuration](../../Configuration)
for starting the server lazily.
