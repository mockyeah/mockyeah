# mockyeah [![Build Status](https://travis-ci.org/ryanricard/mockyeah.svg)](https://travis-ci.org/ryanricard/mockyeah)

__"A powerful service mocking, recording, and playback utility."__

Testing is difficult when you don't have control of your data. mockyeah puts you in complete control, enabling you to implement __real mock web services__ with ease. Real mock services means you have control of response payloads, HTTP Status Codes, response latency, and more.

Have a requirement to implement specific behavior when a service is slow to respond or a server returns an unexpected status code? No problem! mockyeah makes developing for such requirements easy.

## Install
```shell
$ npm install mockyeah --save-dev
```

## Usage

- [Introductory tutorial](#introductory-tutorial)
- [Testing with mockyeah](#testing-with-mockyeah)
- [Examples](https://github.com/ryanricard/mockyeah/tree/master/examples)
- [Configuration](https://github.com/ryanricard/mockyeah/wiki/Configuration)

## API

- [Mock Services](https://github.com/ryanricard/mockyeah/wiki/Mock-Services)
- [Server Management](https://github.com/ryanricard/mockyeah/wiki/Server-Management)
- [Mock Expectations](https://github.com/ryanricard/mockyeah/wiki/Mock-Expectations)
- [Service Snapshots](https://github.com/ryanricard/mockyeah/wiki/Service-Snapshots)

## CLI

- [mockyeah-cli](https://github.com/ryanricard/mockyeah-cli)
- [mockyeah-cli Documentation](https://github.com/ryanricard/mockyeah/wiki/Service-Snapshot-CLI)

## Introductory tutorial
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

## Testing with mockyeah
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

  it('should verify a mock service expectation', (done) => {
    // create service mock with expectation
    const expectation = mockyeah
      .get('/wondrous', { text: 'it worked' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once();

    // invoke request and verify expectation
    request
      .get('/wondrous?foo=bar')
      .expect(200, 'it worked')
      .then(() => {
        expectation.verify();
        done();
      });
  });
});
```
