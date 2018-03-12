# `record()`

`mockyeah.record([snapshot name])`

`snapshot name` (`String`; required) Directory name to save service snapshots
(i.e. `./mockyeah/[snapshot name]`).

Configures mockyeah to proxy and capture service requests. Recorded responses
are written to `./mockyeah`. To use this feature, you must update
the service addresses in your application to proxy through mockyeah. Here is an
example of an address configured for recording:

```
http://localhost:[mockyeah port]/http://example.com/your/service/url
```

The above URL looks pretty crazy, but rest assured it works and eliminates the need for a system level proxy.
