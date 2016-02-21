'use strict';

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset).
 */

const path = require('path');
const tildify = require('tildify');
const Fixture = require('./Fixture');

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
      const fixture = new Fixture(app, fixtureName);
      this.register('all', '*', fixture.record.bind(fixture));
    },

    play: function play(fixtureName) {
      const recorder = new Fixture(app, fixtureName);
      const normalize = path => path.replace(/[\?\=\&\%]+/g, '_').replace(/^\/?/, '/');

      app.use(function (req, res, next) {
        const proxiedUrl = req.url.replace(/^\//, '');
        req.preRewriteUrl = require('url').parse(proxiedUrl).path;
        req.url = normalize(req.preRewriteUrl);
        app.log(['request', 'rewrite'], `${req.originalUrl} to ${req.url}`, true);
        next();
      });

      app.log(['serve', 'fixture'], tildify(recorder.fixturePath));

      recorder.fixture().forEach((route) => {
        const originalPath = route.path;
        const path = normalize(route.path);

        app.log(['serve', 'mount', route.method], originalPath, false);
        app.log(['serve', 'mount', route.method], `${originalPath} at ${path}`, true);

        this.register(route.method.toLowerCase(), path, route.options);
      });
    }
  };
};