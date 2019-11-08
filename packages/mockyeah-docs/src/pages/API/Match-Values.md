---
title: Match Values | API
---

# Match Values

Match values are used both in [mock definitions](Mock-API) and in [expecations](Expectation-API).
They are a way to support generic pattern matching on values.

An match value can be a string, regular expression, plain object, or function that will be tested against a given input value.

A string will be compared for equality with the input value.

A regular expression will be tested with the input value.

Functions will receive the input value as an argument,
and can either explcitly return `true` or `false` to indicate pass or fail,
or they can possibly throw an error, or otherwise return undefined, to indicate
fail or pass respectively.

Plain objects will do a deep partial match, recursively considering each level
in the input value (which is assumed to be an object) as another match value.
