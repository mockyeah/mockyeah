
'use strict';

/**
 * RouteManager
 *  Primary Mock Yeah API (i.e. get, post, put, delete, reset).
 */

const path = require('path');
const RouteSeries = require('./RouteSeries');
const RouteStore = require('./RouteStore');
const log = require('./Logger');

module.exports = function RouteManager(app) {
  const resolveSeriesPath = (seriesName) => {
    return path.resolve(app.config.seriesDir, seriesName);
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

    recordSeries: function recordSeries(seriesName) {
      const seriesPath = resolveSeriesPath(seriesName);
      const series = new RouteSeries(seriesPath);
      this.register('all', '*', series.record.bind(series));
    },

    startSeries: function startSeries(seriesName) {
      const seriesPath = resolveSeriesPath(seriesName);
      const recorder = new RouteSeries(seriesPath);

      log(`Reading series: ${seriesPath}`);
      log('Creating routes:');

      recorder.series().forEach((route) => {
        log(`[${route.method.toUpperCase()}] ${route.path}`);
        this.register(route.method, route.path, route.options);
      });
    }
  };
};