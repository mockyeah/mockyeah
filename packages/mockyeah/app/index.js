'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const async = require('async');
const Logger = require('./lib/Logger');
const RouteManager = require('./lib/RouteManager');
const proxyRoute = require('./lib/proxyRoute');
const makeRecord = require('./makeAPI/makeRecord');
const makeRecordStop = require('./makeAPI/makeRecordStop');
const makePlay = require('./makeAPI/makePlay');
const makePlayAll = require('./makeAPI/makePlayAll');
const makeWatch = require('./makeAPI/makeWatch');
const makeUnwatch = require('./makeAPI/makeUnwatch');
const makeReset = require('./makeAPI/makeReset');

/**
 * App module
 * @param  {Object} config Application configuration.
 * @return {Instances} Instance of an Express application.
 */
module.exports = function App(config) {
  const app = express();

  // Prepare global config
  const globalConfig = {};
  if (global.MOCKYEAH_SUPPRESS_OUTPUT !== undefined) {
    globalConfig.output = !global.MOCKYEAH_SUPPRESS_OUTPUT;
  }
  if (global.MOCKYEAH_VERBOSE_OUTPUT !== undefined) {
    globalConfig.verbose = !!global.MOCKYEAH_VERBOSE_OUTPUT;
  }

  // Prepare configuration. Merge configuration with global and default configuration
  app.config = Object.assign({}, globalConfig, config || {});

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

  app.use(cookieParser())

  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.middlewares = [];

  // A single middleware to execute any/all consumer-configured middleware.
  app.use((req, res, next) => {
    async.series(app.middlewares.map(middleware => cb => middleware(req, res, cb)), err =>
      next(err)
    );
  });

  // Attach RouteManager to app object, the primary set of mockyeah API methods.
  app.routeManager = new RouteManager(app);

  app.locals.proxying = app.config.proxy;

  app.locals.playingSuites = [];
  app.locals.playingAll = false;

  app.locals.recording = app.config.record;
  app.locals.recordMeta = {};

  app.use('/', proxyRoute);

  app.proxy = on => {
    app.locals.proxying = typeof on !== 'undefined' ? on : true;
  };

  app.record = makeRecord(app);
  app.recordStop = makeRecordStop(app);
  app.play = makePlay(app);
  app.playAll = makePlayAll(app);
  app.watch = makeWatch(app);
  app.unwatch = makeUnwatch(app);
  app.reset = makeReset(app);

  if (app.config.watch) {
    app.watch();
  }

  app.use = middleware => {
    app.middlewares.push(middleware);
  };

  return app;
};
