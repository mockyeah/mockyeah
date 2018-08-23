'use strict';

const assert = require('assert');

/**
 * Expectation
 *  Provides mock service assertion api
 */
function Expectation(route) {
  this.route = route;
  this.prefix = `[${this.route.method}] ${this.route.path} --`;
  this.called = 0;
  this.assertions = [];
  this.handlers = [];
  return this;
}

Expectation.prototype.middleware = function middleware(req, res, next) {
  this.called += 1;
  this.handlers.forEach(handler => {
    this.assertions.push(handler.bind(this, req, res, next));
  });
  req.callCount = this.called;
  next();
};

const assertion = function assertion(value, actualValue, message) {
  try {
    const result = value(actualValue);
    if (result !== undefined) {
      assert(result, message);
    }
  } catch (err) {
    assert(false, message);
  }
};

Expectation.prototype.api = function api() {
  const internal = this;
  return {
    atLeast: function atLeast(number) {
      internal.assertions.push(() => {
        assert(
          internal.called >= number,
          `${
            internal.prefix
          } Expected route to be called at least ${number} times, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    atMost: function atMost(number) {
      internal.assertions.push(() => {
        assert(
          internal.called <= number,
          `${
            internal.prefix
          } Expected route to be called at most ${number} times, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    never: function never() {
      internal.assertions.push(() => {
        assert(
          internal.called === 0,
          `${internal.prefix} Expected route to be called never, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    once: function once() {
      internal.assertions.push(() => {
        assert(
          internal.called === 1,
          `${internal.prefix} Expected route to be called once, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    twice: function twice() {
      internal.assertions.push(() => {
        assert(
          internal.called === 2,
          `${internal.prefix} Expected route to be called twice, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    thrice: function thrice() {
      internal.assertions.push(() => {
        assert(
          internal.called === 3,
          `${internal.prefix} Expected route to be called thrice, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    exactly: function exactly(number) {
      internal.assertions.push(() => {
        assert(
          internal.called === number,
          `${internal.prefix} Expected route to be called ${number} times, but it was called ${
            internal.called
          } times`
        );
      });
      return this;
    },
    header: function header(name, value) {
      internal.handlers.push(req => {
        const actualValue = req.get(name);
        if (typeof value === 'function') {
          const message = `${
            internal.prefix
          } Header "${name}: ${actualValue}" did not match expectation callback`;
          assertion(value, actualValue, message);
        } else {
          assert.equal(
            actualValue,
            value,
            `${internal.prefix} Header "${name}: ${value}" expected, but got "${actualValue}"`
          );
        }
      });
      return this;
    },
    params: function params(value) {
      internal.handlers.push(req => {
        if (typeof value === 'function') {
          assertion(
            value,
            req.query,
            `${internal.prefix} Params did not match expectation callback`
          );
        } else {
          assert.deepStrictEqual(
            req.query,
            value,
            `${internal.prefix} Params did not match expected`
          );
        }
      });
      return this;
    },
    body: function body(value) {
      internal.handlers.push(req => {
        if (typeof value === 'function') {
          assertion(value, req.body, `${internal.prefix} Body did not match expectation callback`);
        } else {
          assert.deepStrictEqual(req.body, value, `${internal.prefix} Body did not match expected`);
        }
      });
      return this;
    },
    verify: function verify() {
      internal.assertions.forEach(_assertion => _assertion());
    }
  };
};

module.exports = Expectation;
