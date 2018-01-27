'use strict';

const parse = require('url').parse;
const _ = require('lodash');
const pathToRegExp = require('path-to-regexp');
const Expectation = require('./Expectation');
const routeHandler = require('./routeHandler');

function isEqualMethod(method1, method2) {
  const m1 = method1.toLowerCase();
  const m2 = method2.toLowerCase();
  return m1 === 'all' || m2 === 'all' || m1 === m2;
}

function isRouteForRequest(route, req) {
  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = parse(req.url, true).pathname;

  if (route.pathname !== '*' && !route.pathRegExp.test(pathname)) return false;

  const matchesParams = _.every(route.query, (value, key) => {
    return _.isEqual(_.get(req.query, key), value);
  });

  // TODO: Later add features to match other things, like request body, etc.

  return matchesParams;
}

function isRouteMatch(route1, route2) {
  return (
    route1.pathname === route2.pathname &&
    route1.method === route2.method &&
    _.isEqual(route1.query, route2.query)
  );
}

function listen() {
  if (this.listening) return;

  this.listening = true;

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

  this.listening = false;
}

RouteResolver.prototype.register = function register(method, path, response) {
  const route = { method, path, response };

  if (!_.isFunction(route.response)) {
    route.response = routeHandler.call(this, route.response);
  }

  if (typeof path === 'string') {
    const url = parse(route.path, true);
    route.pathname = url.pathname;
    route.query = url.query;
  } else {
    const object = route.path;
    route.pathname = object.path;
    route.query = object.query || null; // because `url.parse` returns `null`
  }

  route.pathRegExp = pathToRegExp(route.pathname);

  const expectation = new Expectation(route);
  route.expectation = expectation;

  // unregister route if existing
  this.unregister([route]);

  this.routes.push(route);

  // it is necessary to mount catch all route here to avoid overriding middleware
  listen.call(this);

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
