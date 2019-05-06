'use strict';

const _ = require('lodash');
const Expectation = require('./Expectation');
const { compileRoute } = require('./helpers');
const logMatchError = require('./logMatchError');
const routeMatchesRequest = require('./routeMatchesRequest');
const handleDynamicSuite = require('./handleDynamicSuite');

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
    const { app, routes } = this;

    if (handleDynamicSuite(app, req, res)) return;

    const {
      config: { aliases }
    } = app;

    const route = routes.find(r =>
      routeMatchesRequest(r, req, {
        aliases,
        log: logMatchError.bind(null, app)
      })
    );

    if (!route) {
      res.set('x-mockyeah-missed', 'true');

      next();

      return;
    }

    const expectationNext = err => {
      if (err) {
        app.log(['record', 'expectation', 'error'], err);
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

      route.response(app, req, res);
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

RouteResolver.prototype.register = function register(method, _path, response, options) {
  const match = _.isPlainObject(_path)
    ? Object.assign({ method }, _path)
    : {
        method,
        path: _path
      };

  const route = compileRoute(match, response, options);

  const expectation = new Expectation(route);
  route.expectation = expectation;

  // unregister route if existing
  this.unregister([route]);

  this.routes.push(route);

  return {
    expect: predicateOrMatchObject => expectation.api(predicateOrMatchObject)
  };
};

RouteResolver.prototype.unregister = function unregister(routes) {
  this.routes = routes ? this.routes.filter(r1 => !routes.some(r2 => isRouteMatch(r1, r2))) : [];
};

RouteResolver.prototype.reset = function reset() {
  this.unregister();
};

module.exports = RouteResolver;
