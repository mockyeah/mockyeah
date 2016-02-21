'use strict';

const express = require('express');
const Logger = require('./lib/Logger');
const RouteManager = require('./lib/RouteManager');
const RouteResolver = require('./lib/RouteResolver');
const RouteStore = require('./lib/RouteStore');

// TODO: document
module.exports = function App(config) {
  const app = express();
  const defaultConfig = {
    name: 'mockyeah'
  };

  // TODO: document
  app.config = Object.assign({}, defaultConfig, config || {});

  // TODO: document
  const logger = new Logger({
    name: app.config.name
  });

  app.log = logger.log.bind(logger);

  /**
   * Initialize RouteResolver with app
   *  App is needed for unregistering routes on teardown
   */
  const routeResolver = new RouteResolver(app);

  // TODO: document
  const routeStore = new RouteStore(routeResolver);

  /**
   * Attach RouteManager to app object
   *  RouteManager serves as the primary set of mockyeah API methods
   */
  app.routeManager = new RouteManager(app, routeStore);

  app.get('/', (req, res) => {
    res.send('Hello, mockyeah!');
  });

  return app;
};