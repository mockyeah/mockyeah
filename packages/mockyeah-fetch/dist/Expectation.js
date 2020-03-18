"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var assert_1 = __importDefault(require("assert"));
var match_deep_1 = __importDefault(require("match-deep"));
var normalize_1 = require("./normalize");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var isPromise = function (value) {
    return value && (value instanceof Promise || !!(value.then && value["catch"]));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var matchesAssertion = function (value, source, prefixMessage) {
    var _a = match_deep_1["default"](value, source, { skipKeys: ['$meta'] }), result = _a.result, message = _a.message;
    assert_1["default"](result, prefixMessage + ": " + message);
};
var Expectation = /** @class */ (function () {
    function Expectation(match) {
        var originalNormal = match.$meta && match.$meta.originalNormal ? match.$meta.originalNormal : match;
        this.prefix = "[" + (originalNormal.method || 'all') + "] " + (originalNormal.path ||
            originalNormal.url) + " --";
        this.called = 0;
        this.assertions = [];
        this.handlers = [];
        this.verifier = this.verifier.bind(this);
        this.run = this.run.bind(this);
        this.verify = this.verify.bind(this);
    }
    Expectation.prototype.request = function (req) {
        var _this = this;
        this.called += 1;
        this.handlers.forEach(function (handler) {
            _this.assertions.push(handler.bind(_this, req));
        });
    };
    Expectation.prototype.api = function (predicateOrMatchObject) {
        var _this = this;
        if (typeof predicateOrMatchObject === 'function') {
            var predicate_1 = predicateOrMatchObject;
            this.handlers.push(function (req) {
                try {
                    var result = predicate_1(req);
                    if (typeof result !== 'undefined' && !result) {
                        throw new Error('function returned false');
                    }
                }
                catch (err) {
                    var message = _this.prefix + " Expect function did not match" + (err && err.message ? ": " + err.message : '');
                    assert_1["default"](false, message);
                }
            });
        }
        else if (typeof predicateOrMatchObject === 'object') {
            var matchObject_1 = normalize_1.normalize(predicateOrMatchObject);
            this.handlers.push(function (req) {
                var _a = match_deep_1["default"](req, matchObject_1, { skipKeys: ['$meta'] }), result = _a.result, message = _a.message;
                assert_1["default"](result, "Expect object did not match: " + message);
            });
        }
        return this;
    };
    Expectation.prototype.atLeast = function (num) {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called >= num, _this.prefix + " Expected route to be called at least " + num + " times, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.atMost = function (num) {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called <= num, _this.prefix + " Expected route to be called at most " + num + " times, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.never = function () {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called === 0, _this.prefix + " Expected route to be called never, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.once = function () {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called === 1, _this.prefix + " Expected route to be called once, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.twice = function () {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called === 2, _this.prefix + " Expected route to be called twice, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.thrice = function () {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called === 3, _this.prefix + " Expected route to be called thrice, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.exactly = function (num) {
        var _this = this;
        this.assertions.push(function () {
            assert_1["default"](_this.called === num, _this.prefix + " Expected route to be called " + num + " times, but it was called " + _this.called + " times");
        });
        return this;
    };
    Expectation.prototype.path = function (value) {
        var message = this.prefix + " Path did not match expected";
        this.handlers.push(function (req) {
            var path = req.path;
            matchesAssertion(path, value, message);
        });
        return this;
    };
    Expectation.prototype.url = function (value) {
        return this.path(value);
    };
    Expectation.prototype.header = function (name, value) {
        var message = this.prefix + " Header \"" + name + "\" did not match expected";
        this.handlers.push(function (req) {
            matchesAssertion(req.headers && (req.headers[name] || req.headers[name.toLowerCase()]), value, message);
        });
        return this;
    };
    Expectation.prototype.params = function (value) {
        var message = this.prefix + " Params did not match expected";
        this.handlers.push(function (req) {
            matchesAssertion(req.query || {}, value || {}, message);
        });
        return this;
    };
    Expectation.prototype.query = function (value) {
        return this.params(value);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Expectation.prototype.body = function (value) {
        var message = this.prefix + " Body did not match expected";
        this.handlers.push(function (req) {
            matchesAssertion(req.body, value, message);
        });
        return this;
    };
    Expectation.prototype.verifier = function (done) {
        var _this = this;
        return function (err) {
            if (err) {
                done(err);
                return;
            }
            _this.verify(done);
        };
    };
    Expectation.prototype.run = function (handlerOrPromise) {
        if (isPromise(handlerOrPromise)) {
            this.runPromise = handlerOrPromise;
        }
        else {
            this.runPromise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    var result = handlerOrPromise(function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                    if (isPromise(result)) {
                        result.then(resolve)["catch"](reject);
                    }
                });
            });
        }
        return this;
    };
    // eslint-disable-next-line consistent-return
    Expectation.prototype.verify = function (callback) {
        var _this = this;
        var onError = function (err) {
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        };
        var onSuccess = function () {
            try {
                _this.assertions.forEach(function (_assertion) { return _assertion(); });
                if (callback) {
                    callback();
                }
            }
            catch (err) {
                onError(err);
            }
        };
        if (this.runPromise) {
            return this.runPromise.then(onSuccess)["catch"](onError);
        }
        onSuccess();
    };
    return Expectation;
}());
exports.Expectation = Expectation;
