"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const match_deep_1 = __importDefault(require("match-deep"));
const normalize_1 = require("./normalize");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPromise = (value) => value && (value instanceof Promise || !!(value.then && value.catch));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const matchesAssertion = (value, source, prefixMessage) => {
    const { result, message } = match_deep_1.default(value, source, { skipKeys: ['$meta'] });
    assert_1.default(result, `${prefixMessage}: ${message}`);
};
class Expectation {
    constructor(match) {
        const originalNormal = match.$meta && match.$meta.originalNormal ? match.$meta.originalNormal : match;
        this.prefix = `[${originalNormal.method || 'get'}] ${originalNormal.path ||
            originalNormal.url} --`;
        this.called = 0;
        this.assertions = [];
        this.handlers = [];
        this.verifier = this.verifier.bind(this);
        this.run = this.run.bind(this);
        this.verify = this.verify.bind(this);
    }
    request(req) {
        this.called += 1;
        this.handlers.forEach(handler => {
            this.assertions.push(handler.bind(this, req));
        });
    }
    api(predicateOrMatchObject) {
        if (typeof predicateOrMatchObject === 'function') {
            const predicate = predicateOrMatchObject;
            this.handlers.push(req => {
                try {
                    const result = predicate(req);
                    if (typeof result !== 'undefined' && !result) {
                        throw new Error('function returned false');
                    }
                }
                catch (err) {
                    const message = `${this.prefix} Expect function did not match${err && err.message ? `: ${err.message}` : ''}`;
                    assert_1.default(false, message);
                }
            });
        }
        else if (typeof predicateOrMatchObject === 'object') {
            const matchObject = normalize_1.normalize(predicateOrMatchObject);
            this.handlers.push(req => {
                const { result, message } = match_deep_1.default(req, matchObject, { skipKeys: ['$meta'] });
                assert_1.default(result, `Expect object did not match: ${message}`);
            });
        }
        return this;
    }
    atLeast(num) {
        this.assertions.push(() => {
            assert_1.default(this.called >= num, `${this.prefix} Expected route to be called at least ${num} times, but it was called ${this.called} times`);
        });
        return this;
    }
    atMost(num) {
        this.assertions.push(() => {
            assert_1.default(this.called <= num, `${this.prefix} Expected route to be called at most ${num} times, but it was called ${this.called} times`);
        });
        return this;
    }
    never() {
        this.assertions.push(() => {
            assert_1.default(this.called === 0, `${this.prefix} Expected route to be called never, but it was called ${this.called} times`);
        });
        return this;
    }
    once() {
        this.assertions.push(() => {
            assert_1.default(this.called === 1, `${this.prefix} Expected route to be called once, but it was called ${this.called} times`);
        });
        return this;
    }
    twice() {
        this.assertions.push(() => {
            assert_1.default(this.called === 2, `${this.prefix} Expected route to be called twice, but it was called ${this.called} times`);
        });
        return this;
    }
    thrice() {
        this.assertions.push(() => {
            assert_1.default(this.called === 3, `${this.prefix} Expected route to be called thrice, but it was called ${this.called} times`);
        });
        return this;
    }
    exactly(num) {
        this.assertions.push(() => {
            assert_1.default(this.called === num, `${this.prefix} Expected route to be called ${num} times, but it was called ${this.called} times`);
        });
        return this;
    }
    path(value) {
        const message = `${this.prefix} Path did not match expected`;
        this.handlers.push(req => {
            const { path } = req;
            matchesAssertion(path, value, message);
        });
        return this;
    }
    url(value) {
        return this.path(value);
    }
    header(name, value) {
        const message = `${this.prefix} Header "${name}" did not match expected`;
        this.handlers.push(req => {
            matchesAssertion(req.headers && (req.headers[name] || req.headers[name.toLowerCase()]), value, message);
        });
        return this;
    }
    params(value) {
        const message = `${this.prefix} Params did not match expected`;
        this.handlers.push(req => {
            matchesAssertion(req.query || {}, value || {}, message);
        });
        return this;
    }
    query(value) {
        return this.params(value);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body(value) {
        const message = `${this.prefix} Body did not match expected`;
        this.handlers.push(req => {
            matchesAssertion(req.body, value, message);
        });
        return this;
    }
    verifier(done) {
        return (err) => {
            if (err) {
                done(err);
                return;
            }
            this.verify(done);
        };
    }
    run(handlerOrPromise) {
        if (isPromise(handlerOrPromise)) {
            this.runPromise = handlerOrPromise;
        }
        else {
            this.runPromise = new Promise((resolve, reject) => {
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
    }
    // eslint-disable-next-line consistent-return
    verify(callback) {
        const onError = (err) => {
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        };
        const onSuccess = () => {
            try {
                this.assertions.forEach(_assertion => _assertion());
                if (callback) {
                    callback();
                }
            }
            catch (err) {
                onError(err);
            }
        };
        if (this.runPromise) {
            return this.runPromise.then(onSuccess).catch(onError);
        }
        onSuccess();
    }
}
exports.Expectation = Expectation;
//# sourceMappingURL=Expectation.js.map