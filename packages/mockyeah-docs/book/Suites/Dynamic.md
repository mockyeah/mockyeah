# Dynamic Suites

Without mounting suites explicitly via `play` or `playAll`, you can dynamically opt-in to them
using our custom HTTP header `x-mockyeah-suite`, or custom cookie `mockyeahSuite`,
with a value equal to the name of a suite in `suitesDir` from [configuration](../Configuration.md).
