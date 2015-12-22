# Mock Yeah

__"An invaluable service mocking platform built on Express."__

Testing is difficult when you don't have control of your data. This project puts you in complete control, enabling you to implement __real mock web services__ with ease. Real mock services means you have control of response payloads, HTTP Status Codes, response latency, and more.

Have a requirement to implement specific behavior when a service is slow to respond or a server returns an unexpected status code? No problem! This platform makes developing for such requirements easy.

## Package Dependencies

- Mock Yeah was built and tested with Node v4.2.3
- [Mocha](https://mochajs.org/)

## API

### Mock Service Creation API

__mockyeah.get(path, options)__
__mockyeah.put(path, options)__
__mockyeah.post(path, options)__
__mockyeah.delete(path, options__

Each of the methods above create a mock service with a HTTP verb matching its
respective method name.

#### Arguments

##### Path
Path to which to respond. Fully supports all Express path matching
options.

##### Options
Response options informing Mock Yeah how to respond to matching requests. Supported options:
- text (optional) - Text to include in response body. Assumes response Content-Type of `text/plain`.
- type (optional) - Content-Type HTTP header to return with response. Proxies option to Express response method `res.type(type)`; more info here: http://expressjs.com/en/4x/api.html#res.type
- status (optional; default: 200) - HTTP response status code.

### Mock Service Management Methods

#### mockyeah.reset()
Resets all existing mock services. Useful on test teardown.

#### mockyeah.close()
Shuts down the Mock Yeah Express server. Useful if running Mock Yeah with a file
watcher. Mock Yeah attempts to start a new instance of Express each test
iteration. After all tests run, `mockyeah.close()` should be called to shutdown
Mock Yeah's Express server. Failing to do so will result in `EADDRINUSE`
exceptions. This is due to Mock Yeah attempting to start a server on a port
occupied by a server it started previously.

## Contributing

### Getting started

Installing project and dependencies
```shell
# download project
$ git clone git@github.com:ryanricard/mock-yeah.git
$ cd mock-yeah

# install proper Node version
$ nvm install v4.2.3
$ nvm use

# install mocha
$ npm install -g mocha

# if tests pass, you're good to go
$ npm test
```
