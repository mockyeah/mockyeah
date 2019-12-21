# mockyeah

**A powerful service mocking, recording, and playback utility.**

<img src="packages/mockyeah-docs/src/images/logo/mockyeah-600.png" height="200" />

[![npm](https://img.shields.io/npm/v/@mockyeah/server.svg)](https://www.npmjs.com/package/@mockyeah/server)
[![Travis](https://img.shields.io/travis/mockyeah/mockyeah.svg)](https://travis-ci.org/mockyeah/mockyeah)
[![Coveralls github](https://img.shields.io/coveralls/github/mockyeah/mockyeah.svg)](https://coveralls.io/github/mockyeah/mockyeah)

|                                               | mockyeah           | Polly.JS           | nock               | fetch-mock         | pretender          |
| --------------------------------------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| browser support                               | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: | ?                  |
| Node.js support                               | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                |
| Recording suites                              | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Shareable recordings                          | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Hot-reloading suites                          | on roadmap         | :x:                | :x:                | :x:                | :x:                |
| CLI dynamic record & play (server)            | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| CLI dynamic record (client)                   | on roadmap         | :x:                | :x:                | :x:                | :x:                |
| CLI dynamic play (client)                     | on roadmap         | :x:                | :x:                | :x:                | :x:                |
| CLI record groups                             | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Pass-thru/proxy                               | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | ?                  |
| Pass-thru as default                          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:?               |
| Real server                                   | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                |
| Programmatic mocked responses                 | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Delay mocked response                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Default delay                                 | on roadmap         | :x:                | ?                  | :x:                | :x:                |
| Modify real responses                         | on roadmap         | :white_check_mark: | :x:                | :x:?               |
| Delay real response                           | on roadmap         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Domain aliases                                | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Record to disk                                | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                |
| Record to disk from client-side               | on roadmap         | :white_check_mark: | :x:                | :x:                | :x:                |
| Record to local storage                       | on roadmap         | :white_check_mark: | :x:                | :x:                | :x:                |
| `fetch` mocking                               | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| XHR mocking                                   | on roadmap         | :white_check_mark: | :x:                | :x:                | :white_check_mark: |
| Events                                        | on roadmap         | :white_check_mark: | :x:?               | :x:?               | :x:?               |
| Middleware                                    | on roadmap         | :white_check_mark: | :x:?               | :x:?               | :x:                |
| Dynamic mock opt-in                           | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| `n`th mocking                                 | on roadmap         | :white_check_mark: | :white_check_mark: | :x:                | :x:                |
| Sessions                                      | on roadmap         | :x:                | :x:                | :x:                | :x:                |
| Browser extension                             | on roadmap         | :x:                | :x:                | :x:                | :x:                |
| Unit test libraries                           | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                |
| Unit test assertions                          | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Declarative request matching (more than path) | :white_check_mark: | :x:                | :x:                | :x:                | :x:                |
| Programmatic request matching                 | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:?               |

More at **https://mockyeah.js.org**.

## License

mockyeah is released under the [MIT License](https://opensource.org/licenses/MIT).
