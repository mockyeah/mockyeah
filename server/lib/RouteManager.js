'use strict';

/**
 * RouteManager
 *  Primary Mock Yeah API (i.e. get, post, put, delete, reset).
 */

const RouteStore = require('./RouteStore');

module.exports = {
  register: (method, path, response) => {
    RouteStore.register(method, path, response);
  },

  get: function get(path, response) {
    this.register('get', path, response);
  },

  post: function post(path, response) {
    this.register('post', path, response);
  },

  put: function put(path, response) {
    this.register('put', path, response);
  },

  delete: function _delete(path, response) {
    this.register('delete', path, response);
  },

  reset: function reset() {
    RouteStore.reset();
  }
};