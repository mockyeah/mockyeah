'use strict';

/**
 * RouteStore
 *  Keeps record or registered routes.
 *  Necessary in order to unregister routes upon reset.
 */

const RouteResolver = require('./RouteResolver');
let routes = [];

module.exports = {
  register: function register(method, path, response) {
    const route = {
      method,
      path,
      response
    };

    RouteResolver.register(route);

    routes.push(route);
  },

  reset: function reset() {
    RouteResolver.unregister(routes);
    routes = [];
  }
};