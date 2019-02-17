# CLI

mockyeah-cli provides a simple command line interface for recording and playing suites to integrate with during development.

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

3. Initiate a mockyeah suite recording

```shell
$ mockyeah record my-first-suite
```

4. Invoke the service call you previously configured. You should see mockyeah-cli output.

5. Stop mockyeah-cli by hitting enter on the stop question.

6. Play back the suite

```shell
$ mockyeah play my-first-suite
```

7. Invoke the service call again.

Good work! You've recorded and played back a suite.

## Options

```console
$ mockyeah --help

Usage: mockyeah [options] [command]

  Commands:

    ls             list suites
    play [name]    play suite
    playAll        play all suites
    record [name]  record suite
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

    -g, --groups [name]  record with these named groups from configuration (comma-separated and/or repeatable)
    -o, --only [regex]   only record calls to URLs matching given regex pattern (repeatable)
    -h, --use-headers    record headers to response options
    -l, --use-latency    record latency to response options
    -H, --header [pair]  record matches will require these headers ("Name: Value") (repeatable)
    -v, --verbose        verbose output
    -h, --help           output usage information
```
