'use strict';

const tildify = require('tildify');
const CapturePlayer = require('./CapturePlayer');
const CaptureRecorder = require('./CaptureRecorder');
const RouteResolver = require('./RouteResolver');

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset, record, play).
 */
module.exports = function RouteManager(app) {
  const routeResolver = new RouteResolver(app);

  return {
    register: function register(method, _path, response) {
      app.log(['serve', 'mount', method], _path);
      return routeResolver.register(method, _path, response);
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

    reset: function reset() {
      routeResolver.reset();
    },

    record: function record(captureName) {
      const capture = new CaptureRecorder(app, captureName);
      app.use(capture.record.bind(capture));
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
