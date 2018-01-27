'use strict';

const parse = require('url').parse;
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

function isRouteForRequest(route, req) {
  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = normalizePathname(parse(req.url, true).pathname);

  const routePathnameIsAbsoluteUrl = isAbsoluteUrl(route.pathname.replace(/^\//, ''));

  if (routePathnameIsAbsoluteUrl && pathname === route.pathname) return true;

  if (route.pathname !== '*' && !route.pathRegExp.test(pathname)) return false;

  // TODO: Later add features to match other things, like query parameters, etc.

  return true;
}

function isRouteMatch(route1, route2) {
  return route1.pathname === route2.pathname && route1.method === route2.method;
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

RouteResolver.prototype.register = function register(method, path, response) {
  const route = { method, path, response };

  route.pathname = normalizePathname(parse(route.path, true).pathname);
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
