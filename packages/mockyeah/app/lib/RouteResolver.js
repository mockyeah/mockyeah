'use strict';

const _ = require('lodash');
const { parse } = require('url');
const isAbsoluteUrl = require('is-absolute-url');
const Expectation = require('./Expectation');
const {
  compileRoute,
  decodeProtocolAndPort,
  normalizePathname,
  requireSuite
} = require('./helpers');
const matches = require('./matches');

function isEqualMethod(method1, method2) {
  const m1 = method1.toLowerCase();
  const m2 = method2.toLowerCase();
  return m1 === 'all' || m2 === 'all' || m1 === m2;
}

function isRouteForRequest(route, req) {
  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = normalizePathname(parse(req.url, true).pathname);

  const decodedPathname = decodeProtocolAndPort(pathname);

  const reqPathnameIsAbsoluteUrl = isAbsoluteUrl(decodedPathname.toString().replace(/^\//, ''));

  if (reqPathnameIsAbsoluteUrl) {
    // eslint-disable-next-line no-lonely-if
    if (!route.pathFn(pathname)) return false;
  } else {
    // eslint-disable-next-line no-lonely-if
    if (route.pathname !== '*' && !route.pathFn(pathname)) return false;
  }

  if (route.query && !matches(req.query, route.query).result) return false;

  if (route.body && !matches(req.body, route.body).result) return false;

  if (route.headers && !matches(req.headers, route.headers).result) return false;

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
  // Check for an unmounted route dynamically based on header.
  const handleDynamicSuite = (app, req, res) => {
    const dynamicSuite = req.headers['x-mockyeah-suite'];

    if (!dynamicSuite) return false;

    const suite = requireSuite(app, dynamicSuite);

    if (!suite) return false;

    const route = suite.find(r => isRouteForRequest(compileRoute(app, r[0], r[1]), req));

    if (!route) return false;

    // TODO: Do we need to re-compute this?
    const compiledRoute = compileRoute(app, route[0], route[1]);

    compiledRoute.response(req, res);

    return true;
  };

  this.app.all('*', (req, res, next) => {
    if (handleDynamicSuite(this.app, req, res)) return;

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

      // If we have `pathRegExp`, it means we parsed a path string in Express style,
      //  so we can collect the Express-style parameters via `matchKeys`.
      if (route.pathRegExp && route.matchKeys) {
        const match = req.path.match(route.pathRegExp);

        if (match) {
          const params = {};

          route.matchKeys.forEach((key, i) => {
            params[key.name] = match[i + 1];
            params[i] = match[i + 1];
          });

          req.params = params;
        }
      }

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

RouteResolver.prototype.register = function register(method, _path, response) {
  const match = _.isPlainObject(_path)
    ? Object.assign({ method }, _path)
    : {
        method,
        path: _path
      };

  const route = compileRoute(this.app, match, response);

  const expectation = new Expectation(route);
  route.expectation = expectation;

  // unregister route if existing
  this.unregister([route]);

  this.routes.push(route);

  return {
    expect: predicate => expectation.api(predicate)
  };
};

RouteResolver.prototype.unregister = function unregister(routes) {
  this.routes = this.routes.filter(r1 => !routes.some(r2 => isRouteMatch(r1, r2)));
};

RouteResolver.prototype.reset = function reset() {
  this.unregister(this.routes);
};

module.exports = RouteResolver;
