'use strict';

const { parse } = require('url');
const _ = require('lodash');
const pathToRegExp = require('path-to-regexp');
const isAbsoluteUrl = require('is-absolute-url');
const Expectation = require('./Expectation');
const routeHandler = require('./routeHandler');

function isEqualMethod(method1, method2) {
  const m1 = method1.toLowerCase();
  const m2 = method2.toLowerCase();
  return m1 === 'all' || m2 === 'all' || m1 === m2;
}

const justSlashes = /^\/+$/;
const trailingSlashes = /\/+$/;

function normalizePathname(pathname) {
  if (!pathname || justSlashes.test(pathname)) return '/';
  // remove any trailing slashes
  return pathname.replace(trailingSlashes, '');
}

// eslint-disable-next-line consistent-return
function customizer(object, source) {
  if (_.isRegExp(source)) {
    return source.test(object);
  } else if (typeof source === 'function') {
    const result = source(object);
    // if the function returns undefined, we'll skip this to fallback
    if (result !== undefined) return result;
  }
  // else return undefined to fallback to default equality check
}

function isMatchWithCustomizer(object, source) {
  return _.isMatchWith(object, source, customizer);
}

function isEqualWithCustomizer(value, other) {
  return _.isEqualWith(value, other, customizer);
}

function isRouteForRequest(route, req) {
  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = normalizePathname(parse(req.url, true).pathname);

  const routePathnameIsAbsoluteUrl = isAbsoluteUrl(route.pathname.replace(/^\//, ''));

  if (routePathnameIsAbsoluteUrl) {
    // eslint-disable-next-line no-lonely-if
    if (!route.pathRegExp.test(pathname)) return false;
  } else {
    // eslint-disable-next-line no-lonely-if
    if (route.pathname !== '*' && !route.pathRegExp.test(pathname)) return false;
  }

  const matchesParams = _.every(route.query, (value, key) =>
    isEqualWithCustomizer(_.get(req.query, key), value)
  );

  if (!matchesParams) return false;

  // TODO: See what `req.body` looks like with different request content types.
  if (route.body && !isMatchWithCustomizer(req.body, route.body)) return false;

  if (route.headers && !isMatchWithCustomizer(req.headers, route.headers)) return false;

  // TODO: Later add features to match other things, like cookies, or with other types, etc.

  return true;
}

/**
 * This is used for replacing routes, so we need exact matches.
 */
function isRouteMatch(route1, route2) {
  return (
    route1.pathname === route2.pathname &&
    route1.method === route2.method &&
    _.isEqual(route1.query, route2.query) &&
    _.isEqual(route1.body, route2.body) &&
    _.isEqual(route1.headers, route2.headers)
  );
}

function listen() {
  this.app.all('*', (req, res, next) => {
    const route = this.routes.find(r => isRouteForRequest(r, req));

    if (!route) {
      next();
      return;
    }

    const expectationNext = err => {
      if (err) {
        this.app.log(['record', 'expectation', 'error'], err);
        res.sendStatus(500);
        return;
      }

      const match = req.path.match(route.pathRegExp);

      const params = {};

      route.matchKeys.forEach((key, i) => {
        params[key.name] = match[i + 1];
        params[i] = match[i + 1];
      });

      req.params = params;

      route.response(req, res);
    };

    route.expectation.middleware(req, res, expectationNext);
  });
}

/**
 * RouteResolver
 *  Facilitates route registration and unregistration.
 *  Implements Express route middleware based on mockyeah API options.
 */
function RouteResolver(app) {
  this.app = app;

  this.routes = [];

  listen.call(this);
}

const relativizePath = path => (isAbsoluteUrl(path) ? `/${path}` : path);

RouteResolver.prototype.register = function register(method, path, response) {
  const route = {};

  if (typeof path === 'string') {
    path = relativizePath(path);
    const url = parse(path, true);
    route.method = method;
    route.response = response;
    route.path = path;
    route.pathname = normalizePathname(url.pathname);
    route.query = url.query;
  } else {
    const object = path;
    route.method = method;
    route.response = response;
    path = relativizePath(object.path);
    const url = parse(path, true);
    route.path = path;
    route.pathname = normalizePathname(url.pathname);
    route.query = object.query || url.query || null; // because `url.parse` returns `null`
    route.body = object.body;
    route.headers = _.mapKeys(object.headers, (value, key) => key.toLowerCase());
  }

  const matchKeys = [];
  // `pathToRegExp` mutates `matchKeys` to contain a list of named parameters
  route.pathRegExp = pathToRegExp(route.pathname, matchKeys);
  route.matchKeys = matchKeys;

  if (!_.isFunction(route.response)) {
    route.response = routeHandler.call(this, route);
  }

  const expectation = new Expectation(route);
  route.expectation = expectation;

  // unregister route if existing
  this.unregister([route]);

  this.routes.push(route);

  return {
    expect: () => expectation.api()
  };
};

RouteResolver.prototype.unregister = function unregister(routes) {
  this.routes = this.routes.filter(r1 => !routes.some(r2 => isRouteMatch(r1, r2)));
};

RouteResolver.prototype.reset = function reset() {
  this.unregister(this.routes);
};

module.exports = RouteResolver;
