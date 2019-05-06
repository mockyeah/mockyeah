# `Server`

The default export of `mockyeah` is an instance of this class.

So it has all the "Mock API" methods described previously as `mockyeah.*`,
such as `get`, `post`, `record`, `reset`, etc.

It also has a `url` properly which is the root URL of the server,
which is handy when using dynamic `port: 0` in configuration,
for example, in unit tests.

Use it to programmatically construct your own instance of mockyeah, perhaps with dynamic configuration.

First import it:

```js
import Server from 'mockyeah/server';
```

or:

```js
const Server = require('mockyeah/server');
```

Then use it:

```js
const mockyeahServer = new Server({
  // ...configuration options
});
```

For configuration options, see [Configuration](../Configuration.md).
