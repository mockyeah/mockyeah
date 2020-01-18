import assert from 'assert';
import matches from 'match-deep';
import {
  MatchObject,
  Match,
  Matcher,
  VerifyCallback,
  RunHandlerOrPromise,
  RunHandler,
  RequestForHandler,
  MatchString
} from './types';
import { normalize } from './normalize';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPromise = (value: any): boolean =>
  value && (value instanceof Promise || !!(value.then && value.catch));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const matchesAssertion = (value: any, source: any, prefixMessage: string): void => {
  const { result, message } = matches(value, source, { skipKeys: ['$meta'] });
  assert(result, `${prefixMessage}: ${message}`);
};

class Expectation {
  prefix: string;

  called: number;

  assertions: (() => void)[];

  handlers: ((req: RequestForHandler) => void)[];

  runPromise?: Promise<void>;

  constructor(match: MatchObject) {
    const originalNormal =
      match.$meta && match.$meta.originalNormal ? match.$meta.originalNormal : match;

    this.prefix = `[${originalNormal.method || 'get'}] ${originalNormal.path ||
      originalNormal.url} --`;

    this.called = 0;
    this.assertions = [];
    this.handlers = [];

    this.verifier = this.verifier.bind(this);
    this.run = this.run.bind(this);
    this.verify = this.verify.bind(this);
  }

  request(req: RequestForHandler) {
    this.called += 1;
    this.handlers.forEach(handler => {
      this.assertions.push(handler.bind(this, req));
    });
  }

  api(predicateOrMatchObject: Match) {
    if (typeof predicateOrMatchObject === 'function') {
      const predicate = predicateOrMatchObject;
      this.handlers.push(req => {
        try {
          const result = predicate(req);

          if (typeof result !== 'undefined' && !result) {
            throw new Error('function returned false');
          }
        } catch (err) {
          const message = `${this.prefix} Expect function did not match${
            err && err.message ? `: ${err.message}` : ''
          }`;
          assert(false, message);
        }
      });
    } else if (typeof predicateOrMatchObject === 'object') {
      const matchObject = normalize(predicateOrMatchObject);
      this.handlers.push(req => {
        const { result, message } = matches(req, matchObject, { skipKeys: ['$meta'] });
        assert(result, `Expect object did not match: ${message}`);
      });
    }

    return this;
  }

  atLeast(num: number) {
    this.assertions.push(() => {
      assert(
        this.called >= num,
        `${this.prefix} Expected route to be called at least ${num} times, but it was called ${this.called} times`
      );
    });
    return this;
  }

  atMost(num: number) {
    this.assertions.push(() => {
      assert(
        this.called <= num,
        `${this.prefix} Expected route to be called at most ${num} times, but it was called ${this.called} times`
      );
    });
    return this;
  }

  never() {
    this.assertions.push(() => {
      assert(
        this.called === 0,
        `${this.prefix} Expected route to be called never, but it was called ${this.called} times`
      );
    });
    return this;
  }

  once() {
    this.assertions.push(() => {
      assert(
        this.called === 1,
        `${this.prefix} Expected route to be called once, but it was called ${this.called} times`
      );
    });
    return this;
  }

  twice() {
    this.assertions.push(() => {
      assert(
        this.called === 2,
        `${this.prefix} Expected route to be called twice, but it was called ${this.called} times`
      );
    });
    return this;
  }

  thrice() {
    this.assertions.push(() => {
      assert(
        this.called === 3,
        `${this.prefix} Expected route to be called thrice, but it was called ${this.called} times`
      );
    });
    return this;
  }

  exactly(num: number) {
    this.assertions.push(() => {
      assert(
        this.called === num,
        `${this.prefix} Expected route to be called ${num} times, but it was called ${this.called} times`
      );
    });
    return this;
  }

  path(value: Matcher<string>) {
    const message = `${this.prefix} Path did not match expected`;

    this.handlers.push(req => {
      const { path } = req;
      matchesAssertion(path, value, message);
    });

    return this;
  }

  url(value: Matcher<string>) {
    return this.path(value);
  }

  header(name: string, value: Matcher<string>) {
    const message = `${this.prefix} Header "${name}" did not match expected`;

    this.handlers.push(req => {
      matchesAssertion(
        req.headers && (req.headers[name] || req.headers[name.toLowerCase()]),
        value,
        message
      );
    });

    return this;
  }

  params(value: Matcher<Record<string, MatchString>>) {
    const message = `${this.prefix} Params did not match expected`;

    this.handlers.push(req => {
      matchesAssertion(req.query || {}, value || {}, message);
    });

    return this;
  }

  query(value: Matcher<Record<string, MatchString>>) {
    return this.params(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body(value: any) {
    const message = `${this.prefix} Body did not match expected`;

    this.handlers.push(req => {
      matchesAssertion(req.body, value, message);
    });

    return this;
  }

  verifier(done: (err?: Error) => void) {
    return (err?: Error): void => {
      if (err) {
        done(err);
        return;
      }
      this.verify(done);
    };
  }

  run(handlerOrPromise: RunHandlerOrPromise) {
    if (isPromise(handlerOrPromise)) {
      this.runPromise = handlerOrPromise as Promise<void>;
    } else {
      this.runPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          const result = (handlerOrPromise as RunHandler)(err => {
            if (err) {
              reject(err);
              return;
            }

            resolve();
          });

          if (isPromise(result)) {
            (result as Promise<void>).then(resolve).catch(reject);
          }
        });
      });
    }

    return this;
  }

  // eslint-disable-next-line consistent-return
  verify(callback?: VerifyCallback) {
    const onError = (err: Error) => {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    };

    const onSuccess = () => {
      try {
        this.assertions.forEach(_assertion => _assertion());
        if (callback) {
          callback();
        }
      } catch (err) {
        onError(err);
      }
    };

    if (this.runPromise) {
      return this.runPromise.then(onSuccess).catch(onError);
    }

    onSuccess();
  }
}

export { Expectation };
