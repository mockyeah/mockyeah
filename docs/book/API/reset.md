# `reset()`

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
