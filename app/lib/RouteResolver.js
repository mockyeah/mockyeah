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

  // TODO: Later add features to match other things, like query parameters, etc.

  return true;
}

function isRouteMatch(route1, route2) {
  return route1.pathname === route2.pathname && route1.method === route2.method;
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

  route.pathname = parse(route.path, true).pathname;
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
