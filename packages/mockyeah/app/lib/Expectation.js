'use strict';

const assert = require('assert');
const matches = require('./matches');
const { isPromise } = require('./helpers');

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
  this.callback = undefined;
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

const matchesAssertion = (value, source, prefixMessage) => {
  const { result, message } = matches(value, source);
  assert(result, `${prefixMessage}: ${message}`);
};

Expectation.prototype.api = function api(predicateOrMatchObject) {
  const internal = this;

  if (typeof predicateOrMatchObject === 'function') {
    const predicate = predicateOrMatchObject;
    internal.handlers.push(req => {
      try {
        const { headers, query, body, _parsedUrl, method: _method } = req;
        const { pathname: path } = _parsedUrl;
        const method = _method.toLowerCase();

        const result = predicate({
          method,
          path,
          query,
          headers,
          body,
          req
        });

        if (typeof result !== 'undefined' && !result) {
          throw new Error('function returned false');
        }
      } catch (err) {
        const message = `${internal.prefix} Expect function did not match${
          err && err.message ? `: ${err.message}` : ''
        }`;
        assert(false, message);
      }
    });
  } else if (typeof predicateOrMatchObject === 'object') {
    const matchObject = predicateOrMatchObject;
    internal.handlers.push(req => {
      const { headers, query, body, _parsedUrl, method: _method } = req;
      const { pathname: path } = _parsedUrl;
      const method = _method.toLowerCase();

      const { result, message } = matches(
        {
          method,
          path,
          query,
          headers,
          body
        },
        matchObject
      );
      assert(result, `Expect object did not match: ${message}`);
    });
  }

  let runPromise;

  const apiInstance = {
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
    path: function path(value) {
      const message = `${internal.prefix} Path did not match expected`;

      internal.handlers.push(req => {
        const {
          _parsedUrl: { pathname }
        } = req;
        matchesAssertion(pathname, value, message);
      });

      return this;
    },
    url: function url(value) {
      return this.path(value);
    },
    header: function header(name, value) {
      const message = `${internal.prefix} Header "${name}" did not match expected`;

      internal.handlers.push(req => {
        matchesAssertion(req.get(name), value, message);
      });

      return this;
    },
    params: function params(value) {
      const message = `${internal.prefix} Params did not match expected`;

      internal.handlers.push(req => {
        matchesAssertion(req.query, value, message);
      });

      return this;
    },
    query: function query(value) {
      return this.params(value);
    },
    body: function body(value) {
      const message = `${internal.prefix} Body did not match expected`;

      internal.handlers.push(req => {
        matchesAssertion(req.body, value, message);
      });

      return this;
    },
    verifier: done => err => {
      if (err) {
        done(err);
        return;
      }
      apiInstance.verify(done);
    },
    run: function run(handlerOrPromise) {
      if (isPromise(handlerOrPromise)) {
        runPromise = handlerOrPromise;
      } else {
        runPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            const result = handlerOrPromise(err => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            });

            if (isPromise(result)) {
              result.then(resolve).catch(reject);
            }
          });
        });
      }

      return this;
    },
    // eslint-disable-next-line consistent-return
    verify: function verify(callback) {
      const onError = err => {
        if (callback) {
          callback(err);
        } else {
          throw err;
        }
      };

      const onSuccess = () => {
        try {
          internal.assertions.forEach(_assertion => _assertion());
          if (callback) {
            callback();
          }
        } catch (err) {
          onError(err);
        }
      };

      if (runPromise) {
        return runPromise.then(onSuccess).catch(onError);
      }

      onSuccess();
    }
  };

  return apiInstance;
};

module.exports = Expectation;
