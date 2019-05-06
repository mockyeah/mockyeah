# Getting Started

## Install

```sh
npm install mockyeah --save-dev
```

or

```sh
yarn add -D mockyeah
```

## Introductory tutorial

1.  Create an example project and initialized with NPM

    ```shell
    $ mkdir example-app && cd example-app
    $ npm init # all defaults will be fine
    ```

1.  Install `mockyeah`

    ```shell
    $ npm install mockyeah --save-dev
    ```

    or

    ```shell
    $ yarn add -D mockyeah
    ```

1.  Create script file and add the source below

    ```shell
    $ touch index.js
    ```

    ```js
    const mockyeah = require('mockyeah');

    mockyeah.get('/hello-world', { text: 'Hello World' });
    ```

1.  Run the script file with Node

    ```shell
    $ node index.js
    ```

1.  Open [http://localhost:4001/hello-world](http://localhost:4001/hello-world)

1.  Profit. You should see "Hello World" returned from your mock server.

## Testing with mockyeah

```js
const mockyeah = require('mockyeah');
const supertest = require('supertest');

const request = supertest(mockyeah.server.url);

describe('Wondrous service', () => {
  // remove service mocks after each test
  afterEach(() => mockyeah.reset());

  // stop mockyeah server
  after(() => mockyeah.close());

  it('should create a mock service that returns an internal error', done => {
    // create failing service mock
    mockyeah.get('/wondrous', { status: 500 });

    // assert service mock is working
    request.get('/wondrous').expect(500, done);
  });

  it('should create a mock service that returns JSON', done => {
    // create service mock that returns json data
    mockyeah.get('/wondrous', { json: { foo: 'bar' } });

    // assert service mock is working
    request.get('/wondrous').expect(200, { foo: 'bar' }, done);
  });

  it('should verify a mock service expectation', () =>
    // create service mock with expectation
    mockyeah
      .get('/wondrous', { text: 'it worked' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once()
      // invoke request and verify expectation
      .run(request.get('/wondrous?foo=bar'))
      .verify());
});
```
