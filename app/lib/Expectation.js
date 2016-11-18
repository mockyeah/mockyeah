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
  this.handlers.forEach((handler) => {
    this.assertions.push(handler.bind(this, req));
  });
  req.callCount = this.called;
  next();
};

Expectation.prototype.api = function api() {
  const internal = this;
  return {
    atLeast: function atLeast(number) {
      internal.assertions.push(() => {
        assert(internal.called >= number, `${internal.prefix} Expected route to be called at least ${number} times, but it was called ${internal.called} times`);
      });
      return this;
    },
    atMost: function atMost(number) {
      internal.assertions.push(() => {
        assert(internal.called <= number, `${internal.prefix} Expected route to be called at most ${number} times, but it was called ${internal.called} times`);
      });
      return this;
    },
    never: function never() {
      internal.assertions.push(() => {
        assert(internal.called === 0, `${internal.prefix} Expected route to be called never, but it was called ${internal.called} times`);
      });
      return this;
    },
    once: function once() {
      internal.assertions.push(() => {
        assert(internal.called === 1, `${internal.prefix} Expected route to be called once, but it was called ${internal.called} times`);
      });
      return this;
    },
    twice: function twice() {
      internal.assertions.push(() => {
        assert(internal.called === 2, `${internal.prefix} Expected route to be called twice, but it was called ${internal.called} times`);
      });
      return this;
    },
    thrice: function thrice() {
      internal.assertions.push(() => {
        assert(internal.called === 3, `${internal.prefix} Expected route to be called thrice, but it was called ${internal.called} times`);
      });
      return this;
    },
    exactly: function exactly(number) {
      internal.assertions.push(() => {
        assert(internal.called === number, `${internal.prefix} Expected route to be called ${number} times, but it was called ${internal.called} times`);
      });
      return this;
    },
    header: function header(name, value) {
      internal.handlers.push((req) => {
        const actualValue = req.get(name);
        assert.equal(actualValue, value, `${internal.prefix} Expected header value ${name}:${value}, but it was ${actualValue}`);
      });
      return this;
    },
    params: function params(value) {
      internal.handlers.push((req) => {
        assert.deepStrictEqual(req.query, value, `${internal.prefix} Expected params did not match expected for request`);
      });
      return this;
    },
    body: function body(value) {
      internal.handlers.push((req) => {
        assert.deepStrictEqual(req.body, value, `${internal.prefix} Expected body to match expected for request`);
      });
      return this;
    },
    verify: function verify() {
      internal.assertions.forEach((assertion) => assertion());
    }
  };
};

module.exports = Expectation;
