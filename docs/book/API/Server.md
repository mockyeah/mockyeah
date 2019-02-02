# `Server`

The default export of `mockyeah` is an instance of this class.

So it has all the "Mock API" methods described previously as `mockyeah.*`,
such as `get`, `post`, `record`, `reset`, etc.

Use it to programmatically construct your own instance of mockyeah, perhaps with dynamic configuration.

First import it:

```js
import { Server } from "mockyeah";
```

or:

```js
const { Server } = require("mockyeah");
```

or:

```js
const Server = require("mockyeah").Server;
```

Then use it:

```js
const mockyeahServer = new Server({
  // ...configuration options
});
```

For configuration options, see [Configuration](../Configuration).
