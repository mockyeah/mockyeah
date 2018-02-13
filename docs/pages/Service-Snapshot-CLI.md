# Service Snapshot CLI

[mockyeah-cli](https://github.com/ryanricard/mockyeah-cli) provides a simple command line interface for easily capturing and mounting service snapshots to integrate with during development.

## Getting started

#### 1. Install mockyeah-cli

```shell
$ npm install -g mockyeah-cli
```

#### 2. Configure a service integration to proxy through mockyeah

To do so append `http://localhost:4001/` to the beginning of a service end-point in your project like so:

```
http://localhost:4001/http://example.com/your/service/url
```

We agree the above URL looks pretty nutty, but rest assured all other known approaches add unnecessary complexity.

#### 3. Initiate a mockyeah capture

```shell
$ mockyeah record my-first-snapshot
```

#### 4. Invoke the service call you previously configured. You should see mockyeah-cli output.

#### 5. Stop mockyeah-cli with ctrl-c

#### 6. Play back the snapshot

```shell
$ mockyeah play my-first-snapshot
```

#### 7. Invoke the service call again.

Good work! You've captured and mounted a service snapshot.
