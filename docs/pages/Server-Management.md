# API: Server Management

### mockyeah.reset()

Removes all mounted mock services. Best practice is to execute `.reset()` in an "after each" test hook. Example usage with Mocha:

```js
// unmounts all mounted services after each test
afterEach(() => mockyeah.reset());
```

You may remove specific services by passing paths matching services to unmount. Example:
```js
mockyeah.get('/foo-1', { text: 'bar' });
mockyeah.get('/foo-2', { text: 'bar' });
mockyeah.get('/foo-3', { text: 'bar' });

// unmounts only /foo-1 and /foo-2
mockyeah.reset('/foo-1', '/bar-2');
```

### mockyeah.close()

Stops mockyeah Express server. Useful when running mockyeah with a file watcher.
mockyeah will attempt to start a new instance of Express with each iteration of
test execution. After all tests run, `mockyeah.close()` should be called to
shutdown mockyeah's Express server. Failing to do so will result in `EADDRINUSE` 
exceptions. This is due to mockyeah attempting to start a server on an occupied port.
