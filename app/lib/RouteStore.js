'use strict';

const RouteResolver = require('./RouteResolver');

/**
 * RouteStore
 *  Keeps record or registered routes.
 *  Necessary in order to unregister routes upon reset.
 */
function RouteStore(app) {
  this.routeResolver = new RouteResolver(app);
  this.routes = [];
  return this;
}

RouteStore.prototype.register = function register(method, path, response) {
  const route = { method, path, response };
  this.routes.push(route);
  return this.routeResolver.register(route);
};

RouteStore.prototype.reset = function reset(paths) {
  const routes = paths.length ? this.routes.filter((route) => paths.indexOf(route.path) >= 0) : this.routes;
  this.routeResolver.unregister(routes);
  this.routes = [];
};

module.exports = RouteStore;