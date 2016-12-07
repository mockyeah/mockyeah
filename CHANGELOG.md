# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

### [Unreleased]
Nothing to report.

### [0.15.4] - 2016-12-06
#### Fix
- Set context of `onStart` callback to be the server context. Resolves circular JSON exception
received when attempting to pass context as a parameter.

### [0.15.3] - 2016-12-06
#### Add
- Pass server context as parameter to `onStart()` callback when instantiating a server.
- Attach `rootUrl` to server context for consumer reuse.

### [0.15.2] - 2016-11-18
#### Add
- `output`, `journal`, and `verbose` boolean configuration options for configuring mockyeah output.
- Add request journaling to provide greater visibility into mockyeah request handling. Example:
```
[mockyeah][14:54:21][REQUEST][JOURNAL] {
  "callCount": 1,
  "url": "/foo?bar=baa",
  "fullUrl": "http://localhost:4001/foo?bar=baa",
  "clientIp": "127.0.0.1",
  "method": "GET",
  "headers": {
    "host": "localhost:4001",
    "user-agent": "curl/7.43.0",
    "accept": "*/*"
  },
  "query": {
    "bar": "baa"
  },
  "body": {}
}
```
- `[MOUNT]` message now output for all mounted services.
- `[VERBOSE]` indicator added to verbose messages.
- Timestamp added to all logged messages.

### [0.15.1] - 2016-11-02
#### Add
- Mock expectation support. Expectations enable the ability to assert interactivity with mock services. This functionality is currently undocumented for beta testing. Once api is finalized, documentation will be added.

### [0.15.0] - 2016-10-31
#### Fix
- Unregister existing matching routes when registering a new route response via `.[get, post, put, delete]()`. Reported by issue [#20](https://github.com/ryanricard/mockyeah/issues/20).

### [0.14.1] - 2016-05-20
#### Add
- Filter hidden files in capture directories.
- Trap invalid capture JSON parsing errors and throw error for user feedback.
- Trap invalid `fixture` and `filePath` options file paths and log for user feedback. 

### [0.14.0] - 2016-05-20
#### Add
- Split fixtures from captures. Change adds `capturesDir` configuration, and moves captures JSON files to this location.
- Add option validation; provides feedback when required API options are not provided.

### [0.13.4] - 2016-04-03
#### Fix
- Trap invalid `.mockyeah` configuration.
- Fix README links.

### [0.13.3] - 2016-03-16
#### Add
- Add `.mockyeah` configuration documentation.

#### Fix
- Add CORS support.

### [0.13.2] - 2016-03-09
#### Fix
- Normalize fixtures file path to be relative of the `.mockyeah` configuration file location.

### [0.13.1] - 2016-03-04
#### Fix
- Add missing `use strict;` expression.

### [0.13.0] - 2016-03-04
#### Add
- Add capture `.play()` functionality. See documentation.
- Add capture `.record()` functionality. See documentation.
- Implements necessary changes to facilitate [mockyeah-cli](https://github.com/ryanricard/mockyeah-cli)
- Add greater test coverage.

#### Remove
- Remove `.loadSet()` from API, easy multiple service setup is now possible with `.play()`.

[Unreleased]: https://github.com/ryanricard/mockyeah/compare/v0.15.4...HEAD
[0.15.4]: https://github.com/ryanricard/mockyeah/compare/v0.15.3...v0.15.4
[0.15.3]: https://github.com/ryanricard/mockyeah/compare/v0.15.2...v0.15.3
[0.15.2]: https://github.com/ryanricard/mockyeah/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/ryanricard/mockyeah/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/ryanricard/mockyeah/compare/v0.14.1...v0.15.0
[0.14.1]: https://github.com/ryanricard/mockyeah/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/ryanricard/mockyeah/compare/v0.13.3...v0.14.0
[0.13.4]: https://github.com/ryanricard/mockyeah/compare/v0.13.3...v0.13.4
[0.13.3]: https://github.com/ryanricard/mockyeah/compare/v0.13.2...v0.13.3
[0.13.2]: https://github.com/ryanricard/mockyeah/compare/v0.13.1...v0.13.2
[0.13.1]: https://github.com/ryanricard/mockyeah/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/ryanricard/mockyeah/compare/v0.12.1...v0.13.0
