module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash/isEmpty");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("lodash/isPlainObject");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/slicedToArray");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/defineProperty");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("qs");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("path-to-regexp");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("lodash/isRegExp");

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stripQuery", function() { return stripQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var path_to_regexp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var path_to_regexp__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(path_to_regexp__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1);
/* harmony import */ var lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(0);
/* harmony import */ var lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var lodash_isRegExp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(7);
/* harmony import */ var lodash_isRegExp__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(lodash_isRegExp__WEBPACK_IMPORTED_MODULE_7__);



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }







var decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
var decodedProtocolRegex = /^(\/?https?).{3}/;
var encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
var encodedProtocolRegex = /^(\/?https?).{3}/; // Restore any special protocol or port characters that were possibly tilde-replaced.

var decodeProtocolAndPort = function decodeProtocolAndPort(str) {
  return str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');
};

var encodeProtocolAndPort = function encodeProtocolAndPort(str) {
  return str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');
};

var stripQuery = function stripQuery(url) {
  var parsed; // is absolute?

  if (/^https?:/.test(url)) {
    parsed = Object(url__WEBPACK_IMPORTED_MODULE_2__["parse"])(url);
    url = "".concat(parsed.protocol || 'http:', "//").concat(parsed.hostname).concat(parsed.port && !['80', '443'].includes(parsed.port) ? ":".concat(parsed.port) : '').concat(parsed.pathname);
  } else {
    parsed = Object(url__WEBPACK_IMPORTED_MODULE_2__["parse"])("http://example.com".concat(url.startsWith('/') ? url : "/".concat(url)));
    url = parsed.pathname || '';
  }

  var query = parsed.query ? qs__WEBPACK_IMPORTED_MODULE_3___default.a.parse(parsed.query) : undefined;
  return {
    url: url,
    query: query
  };
};

var leadingSlashRegex = /^\//;
var leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;

var stripLeadingSlash = function stripLeadingSlash(url) {
  return url.replace(leadingSlashRegex, '');
};

var makeRequestUrl = function makeRequestUrl(url) {
  var isAbsolute = /^\/+https?[:~][/~]{2}/.test(url);
  return isAbsolute ? decodeProtocolAndPort(stripLeadingSlash(url).replace(leadUrlEncodedProtocolRegex, function (match, p1) {
    return "".concat(p1, "://");
  })) : url;
};

var normalize = function normalize(match, incoming) {
  if (typeof match === 'function') return match;
  var originalMatch = lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5___default()(match) ? _objectSpread({}, match) : match;

  if (!lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5___default()(match)) {
    match = {
      url: match
    };
  } else {
    // shallow copy
    match = _objectSpread({}, match);
  }

  match.query = lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6___default()(match.query) ? undefined : match.query;
  match.headers = lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6___default()(match.headers) ? undefined : Object.entries(match.headers).reduce(function (acc, _ref) {
    var _ref2 = _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0___default()(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    acc[k.toLowerCase()] = v;
    return acc;
  }, {});

  if (!match.method) {
    match.method = 'get';
  } else if (match.method === 'all' || match.method === 'ALL' || match.method === '*') {
    delete match.method;
  } else if (typeof match.method === 'string') {
    match.method = match.method.toLowerCase();
  }

  var $meta = _objectSpread({}, match.$meta || {});

  if (match.path) {
    match.url = match.path;
    delete match.path;
  }

  if (match.url === '*') {
    delete match.url;
  }

  if (typeof match.url === 'string') {
    match.url = makeRequestUrl(match.url);
    var stripped = stripQuery(match.url);
    match.url = stripped.url.replace(/\/+$/, '');
    match.url = match.url || '/';
    match.query = lodash_isPlainObject__WEBPACK_IMPORTED_MODULE_5___default()(match.query) ? _objectSpread({}, stripped.query, {}, match.query) : match.query || stripped.query;
  }

  if (lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6___default()(match.query)) {
    delete match.query;
  }

  if (lodash_isEmpty__WEBPACK_IMPORTED_MODULE_6___default()(match.cookies)) {
    delete match.cookies;
  }

  var originalNormal = _objectSpread({}, match);

  $meta.original = originalMatch;
  $meta.originalNormal = originalNormal;

  if (typeof match.url === 'string') {
    if (!incoming) {
      var matchKeys = []; // `pathToRegexp` mutates `matchKeys` to contain a list of named parameters

      var regex = path_to_regexp__WEBPACK_IMPORTED_MODULE_4___default()(encodeProtocolAndPort(match.url), matchKeys);

      match.url = function (u) {
        return regex.test(encodeProtocolAndPort(u) || encodeProtocolAndPort("/".concat(u)));
      };

      $meta.regex = regex;
      $meta.matchKeys = matchKeys;
      $meta.fn = match.url.toString();
    }
  } else if (lodash_isRegExp__WEBPACK_IMPORTED_MODULE_7___default()(match.url)) {
    if (!incoming) {
      var _regex = match.url;

      match.url = function (u) {
        return _regex.test(decodeProtocolAndPort(u)) || _regex.test(decodeProtocolAndPort("/".concat(u)));
      };

      $meta.regex = _regex;
      $meta.fn = match.url.toString();
    }
  } else if (typeof match.url === 'function') {
    var fn = match.url;

    match.url = function (u) {
      return fn(u) || fn("/".concat(u));
    };
  }

  match.$meta = $meta;
  return match;
};




/***/ })
/******/ ])["default"];