'use strict';

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset).
 */

const path = require('path');
const RouteStore = require('./RouteStore');
let setsDir;

module.exports = function RouteManager(app) {
  return {
    register: (method, _path, response) => {
      RouteStore.register(method, _path, response);
    },

    get: function get(_path, response) {
      this.register('get', _path, response);
    },

    post: function post(_path, response) {
      this.register('post', _path, response);
    },

    put: function put(_path, response) {
      this.register('put', _path, response);
    },

    delete: function _delete(_path, response) {
      this.register('delete', _path, response);
    },

    reset: function reset() {
      RouteStore.reset();
    },

    loadSet: function loadSet(setName) {
      setsDir = setsDir || app.config.setsDir;
      const set = require(path.resolve(setsDir, setName));

      set.forEach((route) => {
        this.register(route.method, route.path, route.options);
      });
    }
  };
};