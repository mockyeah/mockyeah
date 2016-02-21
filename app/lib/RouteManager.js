'use strict';

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset, record, play).
 */

const path = require('path');
const tildify = require('tildify');
const FixturePlayer = require('./FixturePlayer');
const FixtureRecorder = require('./FixtureRecorder');

module.exports = function RouteManager(app, routeStore) {
  return {
    register: function register(method, _path, response) {
      routeStore.register(method, _path, response);
    },

    all: function all(_path, response) {
      this.register('all', _path, response);
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
      routeStore.reset();
    },

    record: function record(fixtureName) {
      const fixture = new FixtureRecorder(app, fixtureName);
      this.register('all', '*', fixture.record.bind(fixture));
    },

    play: function play(fixtureName) {
      const fixture = new FixturePlayer(app, fixtureName);

      app.log(['serve', 'fixture'], tildify(fixture.path));

      fixture.files().forEach((route) => {
        app.log(['serve', 'mount', route.method], route.originalPath, false);
        app.log(['serve', 'mount', route.method], `${route.originalPath} at ${route.path}`, true);

        this.register(route.method, route.path, route.options);
      });
    }
  };
};