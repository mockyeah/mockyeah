'use strict';

const RouteResolver = require('./RouteResolver');

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, patch, delete, reset, record, play).
 */
module.exports = function RouteManager(app) {
  const routeResolver = new RouteResolver(app);

  return {
    register: function register(method, _path, response) {
      app.log(['serve', 'mount', method], _path.path || _path.url || _path);
      return routeResolver.register(method, _path, response);
    },

    all: function all(_path, response) {
      const method = _path.method ? _path.method.toLowerCase() : 'all';
      return this.register(method, _path, response);
    },

    get: function get(_path, response) {
      return this.register('get', _path, response);
    },

    post: function post(_path, response) {
      return this.register('post', _path, response);
    },

    put: function put(_path, response) {
      return this.register('put', _path, response);
    },

    patch: function patch(_path, response) {
      return this.register('patch', _path, response);
    },

    delete: function _delete(_path, response) {
      return this.register('delete', _path, response);
    },

    reset: function reset() {
      routeResolver.reset();
    }
  };
};
