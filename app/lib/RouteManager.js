'use strict';

const tildify = require('tildify');
const CapturePlayer = require('./CapturePlayer');
const CaptureRecorder = require('./CaptureRecorder');
const RouteStore = require('./RouteStore');

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset, record, play).
 */
module.exports = function RouteManager(app) {
  const routeStore = new RouteStore(app);

  return {
    register: function register(method, _path, response) {
      app.log(['serve', 'mount', method], _path);
      return routeStore.register(method, _path, response);
    },

    all: function all(_path, response) {
      return this.register('all', _path, response);
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

    delete: function _delete(_path, response) {
      return this.register('delete', _path, response);
    },

    reset: function reset(/* paths 1, path 2, path 3, etc. */) {
      const paths = [].slice.call(arguments);
      routeStore.reset.call(routeStore, paths);
    },

    record: function record(captureName) {
      const capture = new CaptureRecorder(app, captureName);
      this.register('all', '*', capture.record.bind(capture));
    },

    play: function play(captureName) {
      const capture = new CapturePlayer(app, captureName);

      app.log(['serve', 'capture'], tildify(capture.path));

      capture.files().forEach((route) => {
        app.log(['serve', 'playing', route.method], route.originalPath, false);
        app.log(['serve', 'playing', route.method], `${route.originalPath} at ${route.path}`, true);

        this.register(route.method, route.path, route.options);
      });
    }
  };
};
