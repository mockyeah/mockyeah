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
