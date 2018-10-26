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
  } else if (typeof source === 'number') {
    return source.toString() === object;
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

  const routePathnameIsAbsoluteUrl = isAbsoluteUrl(pathname.toString().replace(/^\//, ''));

  if (routePathnameIsAbsoluteUrl) {
    // eslint-disable-next-line no-lonely-if
    if (!route.pathFn(pathname)) return false;
  } else {
    // eslint-disable-next-line no-lonely-if
    if (route.pathname !== '*' && !route.pathFn(pathname)) return false;
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

      // If we have `pathRegExp`, it means we parsed a path string in Express style,
      //  so we can collect the Express-style parameters via `matchKeys`.
      if (route.pathRegExp) {
        const match = req.path.match(route.pathRegExp);

        const params = {};

        route.matchKeys.forEach((key, i) => {
          params[key.name] = match[i + 1];
          params[i] = match[i + 1];
        });

        req.params = params;
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

const relativizePath = path => (isAbsoluteUrl(path) ? `/${path}` : path);

const handlePathTypes = (_path, _query) => {
  if (typeof _path === 'string') {
    const path = relativizePath(_path);
    const url = parse(path, true);
    const pathname = normalizePathname(url.pathname);

    const matchKeys = [];
    // `pathToRegExp` mutates `matchKeys` to contain a list of named parameters
    const pathRegExp = pathToRegExp(pathname, matchKeys);

    const query = Object.assign({}, url.query, _query);

    return {
      matchKeys,
      path,
      pathFn: p => pathRegExp.test(p),
      pathname,
      pathRegExp,
      query
    };
  }

  if (_path instanceof RegExp) {
    // TODO: Maybe support `matchKeys` with index of match or maybe even named capture groups?

    return {
      path: _path,
      pathFn: p => _path.test(p),
      pathname: _path
    };
  }

  if (typeof _path === 'function') {
    return {
      path: _path,
      pathFn: _path,
      pathname: _path
    };
  }

  throw new Error(`Unsupported path type ${typeof _path}: ${_path}`);
};

RouteResolver.prototype.register = function register(method, _path, response) {
  const route = {
    method,
    response
  };

  if (!_.isPlainObject(_path)) {
    Object.assign(route, handlePathTypes(_path));
  } else {
    const object = _path;
    const headers = _.mapKeys(object.headers, (value, key) => key.toLowerCase());

    Object.assign(route, handlePathTypes(object.path || object.url, object.query), {
      body: object.body,
      headers
    });
  }

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
