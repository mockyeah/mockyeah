# `close()`

Stops mockyeah Express server. Useful when running mockyeah with a file watcher.
mockyeah will attempt to start a new instance of Express with each iteration of
test execution. After all tests run, `mockyeah.close()` should be called to
shutdown mockyeah's Express server. Failing to do so will result in `EADDRINUSE`
exceptions. This is due to mockyeah attempting to start a server on an occupied port.
