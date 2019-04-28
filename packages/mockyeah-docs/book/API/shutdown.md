# `shutdown()`

`mockyeah.shutdown(callback)`

Combines [`shutdown()`](./shutdown.md) and [`unwatch()`](./unwatch.md).
Optional callback to be exceuted when closing completes.
Passed an error as first argument if the closing fails. Also returns a promise.
