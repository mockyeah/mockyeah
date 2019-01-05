# CLI

mockyeah-cli provides a simple command line interface for recording and playing service snapshots to integrate with during development.

## Getting started

1. Install mockyeah-cli

```shell
$ npm install -g mockyeah-cli
```

or

```
$ yarn global add mockyeah-cli
```

2. Configure a service call to proxy through mockyeah

To do so prepend `http://localhost:4001/` to the beginning of a service end-point in your project like so:

```
http://localhost:4001/http://example.com/your/service/url
```

We agree the above URL looks pretty nutty, but rest assured all other known approaches add unnecessary complexity.

3. Initiate a mockyeah snapshot recording

```shell
$ mockyeah record my-first-snapshot
```

4. Invoke the service call you previously configured. You should see mockyeah-cli output.

5. Stop mockyeah-cli by hitting enter on the stop question.

6. Play back the snapshot

```shell
$ mockyeah play my-first-snapshot
```

7. Invoke the service call again.

Good work! You've recorded and played back a service snapshot.

## Options

```console
$ mockyeah --help
Usage: mockyeah [options] [command]

  Commands:

    ls             list service captures
    play [name]    play service capture
    playAll        play all service captures
    record [name]  record service capture
    help [cmd]     display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

For help with specific commands, you can pass `--help` to them, e.g.:

```console
$ mockyeah record --help
Usage: mockyeah-record [options]

  Options:

    -h, --help           output usage information
    -o, --only <regex>   only record calls to URLs matching given regex pattern
    -h, --header <line>  record matches will require these headers ("Name: Value")
    -v, --verbose        verbose output
```
