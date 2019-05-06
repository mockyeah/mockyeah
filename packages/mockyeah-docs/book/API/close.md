# `close()`

`mockyeah.close(callback)`

`callback` (`Function`; optional) To be exceuted when closing completes.
Passed an error as first argument if the closing fails. Also returns a promise.

Stops mockyeah Express server.

Also implicitly calls [`unwatch()`](./unwatch.md) to stop the file watching.

After all tests run, `mockyeah.close()` should be called to
shutdown mockyeah's Express server. Failing to do so will result in `EADDRINUSE`
exceptions. This is due to mockyeah attempting to start a server on an occupied port.
