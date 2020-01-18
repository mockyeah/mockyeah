# match-deep

A deep matching library.

```js
matchDeep(value, source, options?)
```

```js
import matchDeep from 'match-deep';

const matches = matchDeep(
  {
    a: 1,
    b: 2
  },
  {
    c: 1,
    d: 2
  },
  {
    shortCircuit: true
  }
);

console.log(matches);
/*

{
  result: false,
  message: 'Number `1` and value `undefined` not equal for "c" ' +
    'Number `2` and value `undefined` not equal for "d"',
  errors: [
    {
      message: 'Number `1` and value `undefined` not equal',
      keyPath: [Array]
    },
    {
      message: 'Number `2` and value `undefined` not equal',
      keyPath: [Array]
    }
  ]
}

*/
```

## Options

Defaults:

<!-- prettier-ignore -->
```js
{
  shortCircuit: false,
  skipKeys: [],
  serializedRegex: false
}
```

`shortCircuit` (`boolean`) - `true` will stop on the first match error and report only that one, which can help performance.

`skipKeys` (`string[]`) - an array of key names under which to not do comparisons - all keys are considered by default.

`serializedRegex` (`boolean`) - `true` will interpret `{ $regex: { source: 'a.*b', flags: 'i' } }` as if it were `/a.*b/i`.
This allows for serialization of regular expressions over JSON.
Also supports optional `flags` as in `{ $regex: { source: 'a.*b' } }`, and just a `source` string as in `{ $regex: 'a.*b' }`.
