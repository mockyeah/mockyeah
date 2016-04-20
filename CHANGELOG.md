# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

### [Unreleased]
- Response options validation.

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

[Unreleased]: https://github.com/ryanricard/mockyeah/compare/v0.13.4...HEAD
[0.13.4]: https://github.com/ryanricard/mockyeah/compare/v0.13.3...v0.13.4
[0.13.3]: https://github.com/ryanricard/mockyeah/compare/v0.13.2...v0.13.3
[0.13.2]: https://github.com/ryanricard/mockyeah/compare/v0.13.1...v0.13.2
[0.13.1]: https://github.com/ryanricard/mockyeah/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/ryanricard/mockyeah/compare/v0.12.1...v0.13.0
