'use strict';

const express = require('express');
const Logger = require('./lib/Logger');
const RouteManager = require('./lib/RouteManager');

/**
 * App module
 * @param  {Object} config Application configuration.
 * @return {Instances} Instance of an Express application.
 */
module.exports = function App(config) {
  const app = express();

  const defaultConfig = {
    name: 'mockyeah'
  };

  /**
   * Prepare configuration. Merge configuration with default configuration
   */
  app.config = Object.assign({}, defaultConfig, config || {});

  /**
   * Instantiate logger and attach log to app instance.
   *   This is necessary to avoid crossing output
   *   information when running multiple instances.
   */
  const logger = new Logger({
    name: app.config.name
  });

  app.log = logger.log.bind(logger);

  /**
   * Attach RouteManager to app object
   *  RouteManager serves as the primary set of mockyeah API methods
   */
  app.routeManager = new RouteManager(app);

  app.get('/', (req, res) => {
    res.send('Hello, mockyeah!');
  });

  return app;
};