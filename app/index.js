'use strict';

const express = require('express');
const bodyParser = require('body-parser');
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
    name: 'mockyeah',
    output: true,
    journal: false,
    verbose: false
  };

  // Prepare global config
  const globalConfig = {};
  if (global.MOCKYEAH_SUPPRESS_OUTPUT !== undefined) globalConfig.output = !global.MOCKYEAH_SUPPRESS_OUTPUT;
  if (global.MOCKYEAH_VERBOSE_OUTPUT !== undefined) globalConfig.verbose = !!global.MOCKYEAH_VERBOSE_OUTPUT;

  // Prepare configuration. Merge configuration with global and default configuration
  app.config = Object.assign({}, defaultConfig, globalConfig, config || {});

  // Instantiate new logger
  const logger = new Logger({
    name: app.config.name,
    output: app.config.output,
    verbose: app.config.verbose
  });

  // Attach log to app instance to bind output to app instance
  app.log = logger.log.bind(logger);

  // Provide user feedback when verbose output is enabled
  app.log('info', 'verbose output enabled', true);

  // Attach RouteManager to app object, the primary set of mockyeah API methods.
  app.routeManager = new RouteManager(app);

  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.send('Hello, mockyeah!');
  });

  return app;
};