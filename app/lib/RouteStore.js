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
  this.routeResolver.register(route);
  this.routes.push(route);
};

RouteStore.prototype.reset = function reset() {
  this.routeResolver.unregister(this.routes);
  this.routes = [];
};

module.exports = RouteStore;