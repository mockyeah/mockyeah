
'use strict';

/**
 * RouteManager
 *  Primary mockyeah API (i.e. get, post, put, delete, reset).
 */

const path = require('path');
const tildify = require('tildify');
const Fixture = require('./Fixture');
const RouteStore = require('./RouteStore');
const log = require('./Logger');

module.exports = function RouteManager(app) {
  const resolveFixturePath = (fixtureName) => {
    return path.resolve(app.config.fixturesDir, fixtureName);
  };

  return {
    register: (method, _path, response) => {
      RouteStore.register(method, _path, response);
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
      RouteStore.reset();
    },

    record: function record(fixtureName, options) {
      const fixturePath = resolveFixturePath(fixtureName);
      const fixture = new Fixture(fixturePath);
      this.register('all', '*', fixture.record.bind(fixture));
    },

    play: function play(fixtureName, options) {
      // const vlog = require('./Verbose')(options.verbose);
      const verbose = options.verbose;
      const fixturePath = resolveFixturePath(fixtureName);
      const recorder = new Fixture(fixturePath);
      const normalize = path => path.replace(/[\?\=\&\%]+/g, '_').replace(/^\/?/, '/');

      app.use(function (req, res, next) {
        const proxiedUrl = req.url.replace(/^\//, '');
        req.preRewriteUrl = require('url').parse(proxiedUrl).path;
        req.url = normalize(req.preRewriteUrl);
        req.verbose = options.verbose;
        log(['request', 'rewrite'], `${req.originalUrl} to ${req.url}`, verbose);
        next();
      });

      log(['serve', 'fixture'], tildify(fixturePath));

      recorder.fixture().forEach((route) => {
        const originalPath = route.path;
        const path = normalize(route.path);

        log(['serve', 'mount', route.method], originalPath, !verbose);
        log(['serve', 'mount', route.method], `${originalPath} at ${path}`, verbose);

        this.register(route.method.toLowerCase(), path, route.options);
      });
    }
  };
};