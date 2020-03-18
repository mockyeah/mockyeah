"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var mime_1 = __importDefault(require("mime"));
var handler = function (value, requestForHandler, res) {
    return typeof value === 'function' ? value(requestForHandler, res) : value;
};
var respond = function (matchingMock, requestForHandler, bootOptions, res) { return __awaiter(void 0, void 0, void 0, function () {
    var responseHeaders, fixtureResolver, fileResolver, resOpts, status, _a, body, type, _b, contentType, json, fixture, _c, filePath, _d, headers, _e, _f, responseInit, latency, latencyActual_1, response;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                responseHeaders = bootOptions.responseHeaders, fixtureResolver = bootOptions.fixtureResolver, fileResolver = bootOptions.fileResolver;
                resOpts = matchingMock[1] || {};
                _a = resOpts.status;
                if (!_a) return [3 /*break*/, 2];
                return [4 /*yield*/, handler(resOpts.status, requestForHandler, res)];
            case 1:
                _a = (_g.sent());
                _g.label = 2;
            case 2:
                status = (_a) || 200;
                _b = resOpts.type;
                if (!_b) return [3 /*break*/, 4];
                return [4 /*yield*/, handler(resOpts.type, requestForHandler, res)];
            case 3:
                _b = (_g.sent());
                _g.label = 4;
            case 4:
                type = _b;
                if (!resOpts.fixture) return [3 /*break*/, 9];
                if (!fixtureResolver) {
                    throw new Error('Using `fixture` in mock response options requires a `fixtureResolver`.');
                }
                return [4 /*yield*/, handler(resOpts.fixture, requestForHandler, res)];
            case 5:
                fixture = _g.sent();
                type = type || fixture; // TODO: Use base name only to conceal file path?
                if (!fixture) return [3 /*break*/, 7];
                return [4 /*yield*/, fixtureResolver(fixture)];
            case 6:
                _c = _g.sent();
                return [3 /*break*/, 8];
            case 7:
                _c = undefined;
                _g.label = 8;
            case 8:
                body = _c;
                return [3 /*break*/, 22];
            case 9:
                if (!resOpts.filePath) return [3 /*break*/, 14];
                if (!fileResolver) {
                    throw new Error('Using `filePath` in mock response options requires a `fileResolver`.');
                }
                return [4 /*yield*/, handler(resOpts.filePath, requestForHandler, res)];
            case 10:
                filePath = _g.sent();
                type = type || filePath; // TODO: Use base name only to conceal file path?
                if (!filePath) return [3 /*break*/, 12];
                return [4 /*yield*/, fileResolver(filePath)];
            case 11:
                _d = _g.sent();
                return [3 /*break*/, 13];
            case 12:
                _d = undefined;
                _g.label = 13;
            case 13:
                body = _d;
                return [3 /*break*/, 22];
            case 14:
                if (!resOpts.json) return [3 /*break*/, 16];
                return [4 /*yield*/, handler(resOpts.json, requestForHandler, res)];
            case 15:
                json = _g.sent();
                body = JSON.stringify(json);
                contentType = 'application/json; charset=UTF-8';
                return [3 /*break*/, 22];
            case 16:
                if (!resOpts.text) return [3 /*break*/, 18];
                return [4 /*yield*/, handler(resOpts.text, requestForHandler, res)];
            case 17:
                body = _g.sent();
                contentType = 'text/plain; charset=UTF-8';
                return [3 /*break*/, 22];
            case 18:
                if (!resOpts.html) return [3 /*break*/, 20];
                return [4 /*yield*/, handler(resOpts.html, requestForHandler, res)];
            case 19:
                body = _g.sent();
                contentType = 'text/html; charset=UTF-8';
                return [3 /*break*/, 22];
            case 20:
                if (!resOpts.raw) return [3 /*break*/, 22];
                return [4 /*yield*/, handler(resOpts.raw, requestForHandler, res)];
            case 21:
                // TODO: This has different semantics than the Express version.
                body = _g.sent();
                contentType = undefined;
                _g.label = 22;
            case 22:
                body = body || '';
                contentType = type ? mime_1["default"].getType(type) || type : contentType;
                if (!resOpts.headers) return [3 /*break*/, 24];
                _f = [{}];
                return [4 /*yield*/, handler(resOpts.headers, requestForHandler, res)];
            case 23:
                _e = __assign.apply(void 0, _f.concat([(_g.sent())]));
                return [3 /*break*/, 25];
            case 24:
                _e = {};
                _g.label = 25;
            case 25:
                headers = _e;
                if (responseHeaders) {
                    headers['x-mockyeah-mocked'] = 'true';
                }
                if (contentType) {
                    headers['content-type'] = contentType;
                }
                responseInit = {
                    status: status,
                    headers: headers
                };
                latency = resOpts.latency || bootOptions.latency;
                if (!latency) return [3 /*break*/, 28];
                return [4 /*yield*/, handler(latency, requestForHandler, res)];
            case 26:
                latencyActual_1 = _g.sent();
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, latencyActual_1); })];
            case 27:
                _g.sent();
                _g.label = 28;
            case 28:
                response = new Response(body, responseInit);
                // eslint-disable-next-line consistent-return
                return [2 /*return*/, {
                        response: response,
                        body: body,
                        headers: headers,
                        json: json
                    }];
        }
    });
}); };
exports.respond = respond;
