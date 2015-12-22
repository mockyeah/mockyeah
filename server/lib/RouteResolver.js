'use strict';

/**
 * RouteResolver
 *  Facilitates route registration and unregistration.
 *  Implements Express route middleware based on Mock Yeah API options.
 */

const _ = require('lodash');
let app;

const handler = function handler(response) {
  response = response || {};
  return (req, res) => {
    res.status(response.status || 200).send();
  };
};

module.exports = function RouteResolver(_app) {
  app = _app;
};

module.exports.register = function register(route) {
  if (!_.isFunction(route.response)) {
    route.response = handler(route.response);
  }

  app[route.method](route.path, route.response);
};

module.exports.unregister = function unregister(routes) {
  const routePaths = routes.map((route) => { return route.path; });

  app._router.stack = app._router.stack.filter((layer) => {
    return !(layer.route && routePaths.indexOf(layer.route.path) >= 0);
  });
};