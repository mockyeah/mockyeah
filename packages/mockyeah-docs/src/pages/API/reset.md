# `reset()`

Removes all mounted mock services. Best practice is to execute `.reset()` in an "after each" test hook. Example usage with Mocha:

```js
// unmounts all mounted services after each test
afterEach(() => mockyeah.reset());
```
