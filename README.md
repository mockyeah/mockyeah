# mockyeah [![Build Status](https://travis-ci.org/ryanricard/mockyeah.svg)](https://travis-ci.org/ryanricard/mockyeah)

__"An invaluable service mocking platform built on Express."__

Testing is difficult when you don't have control of your data. This project puts you in complete control, enabling you to implement __real mock web services__ with ease. Real mock services means you have control of response payloads, HTTP Status Codes, response latency, and more.

Have a requirement to implement specific behavior when a service is slow to respond or a server returns an unexpected status code? No problem! This platform makes developing for such requirements easy.

## Install
```shell
$ npm install mockyeah --save-dev
```

## Usage

- [Introductory tutorial](#introductory-tutorial)
- [Testing example](#testing-example)

## API

### Mock service creation API
__mockyeah.get(path, options)__<br/>
__mockyeah.put(path, options)__<br/>
__mockyeah.post(path, options)__<br/>
__mockyeah.delete(path, options)__<br/>
__mockyeah.all(path, options)__<br/>

Each of the methods creates a mock service with a HTTP verb matching its respective method name.

#### Parameters

##### Path `String`
Path to which to mount service. Fully supports all Express path matching options.

##### Options `Object`
Response options informing mockyeah how to respond to matching requests. Supported options:

__One of the following options may be used per service:__
- `filePath` (`String`; optional) - File with contents to include in response body. Assumes response Content-Type of file type.
- `fixture` (`String`; optional) - Fixture file with contents to include in response body. Assumes response Content-Type of file type. Default fixture file location is `./fixtures` in your project.
- `html` (`String`; optional) - HTML to include in response body. Assumes response Content-Type of `text/html`.
- `json` (`Object`; optional) - JSON to include in response body. Assumes response Content-Type of `application/json`.
- `raw` (`String`; optional) - Text to include in response body. Content-Type is the default Express type if not specified in header.
- `text` (`String`; optional) - Text to include in response body. Assumes response Content-Type of `text/plain`.

__Additional options:__
- `headers` (`Object`; optional) - Header key value pairs to include in response.
- `latency` (`Number` in Milliseconds; optional) - Used to control the response timing of a response.
- `type` (`String`; optional) - Content-Type HTTP header to return with response. Proxies option to Express response method `res.type(type)`; more info here: http://expressjs.com/en/4x/api.html#res.type
- `status` (`String`; optional; default: `200`) - HTTP response status code.


### Service capture recording and playback
__mockyeah.record(name)__

`name` (`String`; required) Directory name to save service responses recordings
(i.e. `./mockyeah/[recording name]`).

Configures mockyeah to proxy and record service requests. Recorded responses
are written to `./mockyeah`. To use this feature, you must update
the service addresses in your application to proxy through mockyeah. Here is an
example of an address configured for recording:

```
http://localhost:[mockyeah port]/http://example.com/your/service/url
```

__mockyeah.play(name)__

`name` (`String`; required) Directory name from which to mount contained
service responses recordings (i.e. `./mockyeah/[recording name]`).

Mounts each service response captured during a recording. Each service response
will be mounted with exact same payload, headers, status, and latency as
experienced during recording. This behavior may be changed by altering the values
in the captured service response file.

Here is an example of a service response file:
```json
{
  "method": "GET",
  "url": "http://example.com/some/service",
  "path": "/some/service",
  "options": {
    "headers": {
      "x-powered-by": "Express",
      "content-type": "text/plain; charset=utf-8",
      "content-length": "12",
      "etag": "W/\"5-iwTV43ddKY54RV78XKQE1Q\"",
      "date": "Sun, 21 Feb 2016 06:17:49 GMT",
      "connection": "close"
    },
    "status": 200,
    "raw": "Hello world!",
    "latency": 57
  }
}
```

Pseudo recordings may be created manually to ease repetitive setup of multiple
services. Here are the steps to creating a pseudo recording:

1. Create a recording directory (e.g. `./mockyeah/pseudo-example`)
2. Add one or more JSON files containing the following properties, at minimum:
  ```json
    {
      "method": "GET",
      "path": "/some/service",
      "options": {
        "text": "Hello world!"
      }
    }
  ```
  See [Mock service creation API](#Mock-service-creation-API) for details on supported `options`.

3. Play your pseudo recording.
  ```js
    require('mockyeah').play('pseudo-example');
  ```
4. That's it!

### Mock service and server management
__mockyeah.reset()__

Removes all mounted mock services. Useful during after test teardown.

__mockyeah.close()__

Stops mockyeah Express server. Useful when running mockyeah with a file watcher.
mockyeah will attempt to start a new instance of Express with each iteration of
test execution. After all tests run, `mockyeah.close()` should be called to
shutdown mockyeah's Express server. Failing to do so will likely result in
`EADDRINUSE` exceptions. This is due to mockyeah attempting to start a server on
an occupied port.

### mockyeah configuration
__Default `.mockyeah` configuration:__

```json
{
  "name": "mockyeah",
  "host": "localhost",
  "port": 4001,
  "fixturesDir": "./fixtures",
  "capturesDir": "./mockyeah"
}
```
__Configuration options:__
- `name`: Used to identify the origin of logged output.
- `host`: Host on which mockyeah will run.
- `port`: Port on which mockyeah will run.
- `fixturesDir`: Relative path to the fixtures directory.
- `capturesDir`: Relative path to the captures directory.

Overriding any of these configurations can be done by placing a `.mockyeah`
file in root of the project and adding the key value pair that needs to be updated.
This file should be written using standard `JSON`.

### Introductory tutorial
1. Create an example project and initialized with NPM
  ```shell
  $ mkdir example-app && cd example-app
  $ npm init # all defaults will be fine
  ```

1. Install `mockyeah`
  ```shell
  $ npm install mockyeah --save-dev
  ```

1. Create script file and add the source below
  ```shell
  $ touch index.js
  ```
  ```js
  const mockyeah = require('mockyeah');

  mockyeah.get('/hello-world', { text: 'Hello World' });
  ```

1. Run the script file with Node
  ```shell
  $ node index.js
  ```

1. Open [http://localhost:4001/hello-world](http://localhost:4001/hello-world)

1. Profit. You should see "Hello World" returned from your mock server.

### Testing example
```js
const request = require('supertest')('http://localhost:4001');
const mockyeah = require('mockyeah');

describe('Wondrous service', () => {
  // remove service mocks after each test
  afterEach(() => mockyeah.reset());

  // stop mockyeah server
  after(() => mockyeah.close());

  it('should create a mock service that returns an internal error', (done) => {
    // create failing service mock
    mockyeah.get('/wondrous', { status: 500 });

    // assert service mock is working
    request
      .get('/wondrous')
      .expect(500, done);
  });

  it('should create a mock service that returns JSON', (done) => {
    // create service mock that returns json data
    mockyeah.get('/wondrous', { json: { foo: 'bar' } });

    // assert service mock is working
    request
      .get('/wondrous')
      .expect(200, { foo: 'bar' }, done);
  });
});
```

## Package dependencies
- mockyeah was built and tested with Node v4.2.3
- [Mocha](https://mochajs.org/)

## Contributing

### Getting started
Installing project and dependencies
```shell
# download project
$ git clone git@github.com:ryanricard/mockyeah.git
$ cd mockyeah

# install proper Node version
$ nvm install v4.2.3
$ nvm use

# install mocha
$ npm install -g mocha

# if tests pass, you're good to go
$ npm test
```
