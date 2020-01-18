'use strict';

const EventEmitter = require('events');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const fetch = require('isomorphic-fetch');
const MockyeahFetch = require('@mockyeah/fetch');
const Logger = require('./lib/Logger');
const proxyRoute = require('./lib/proxyRoute');
const { modifyMockForMockyeahFetch } = require('./lib/modifyMockForMockyeahFetch');
const makeRecord = require('./makeAPI/makeRecord');
const makeRecordStop = require('./makeAPI/makeRecordStop');
const makePlay = require('./makeAPI/makePlay');
const makePlayAll = require('./makeAPI/makePlayAll');
const makeWatch = require('./makeAPI/makeWatch');
const makeUnwatch = require('./makeAPI/makeUnwatch');
const makeReset = require('./makeAPI/makeReset');
const { makeFileResolver, makeFixtureResolver } = require('./lib/fileResolver');

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

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

  app.use(cookieParser());

  app.use(bodyParser.json({ verify: rawBodySaver }));
  app.use(bodyParser.text({ verify: rawBodySaver }));
  // TODO: Consider `extended: true`.
  app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: false }));
  app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

  app.locals.proxying = app.config.proxy;

  app.locals.playingSuites = [];
  app.locals.playingAll = false;

  app.locals.recording = app.config.record;
  app.locals.recordMeta = {};

  const mockyeahFetch = new MockyeahFetch({
    noPolyfill: true,
    noWebSocket: true,
    fetch,
    name: app.config.name,
    aliases: app.config.aliases,
    responseHeaders: true, // we'll use these to coordinate logging and manually delete from response
    noProxy: !app.config.proxy,
    host: app.config.host,
    port: app.config.port,
    latency: app.config.latency,
    portHttps: app.config.portHttps,
    suiteHeader: app.config.suiteHeader,
    suiteCookie: app.config.suiteCookie,
    fileResolver: makeFileResolver(app),
    fixtureResolver: makeFixtureResolver(app)
  });

  app.locals.mockyeahFetch = mockyeahFetch;

  app.locals.methods = _.mapValues(mockyeahFetch.methods, (value, key) => (_match, _resOpts) => {
    const method = key;
    const [match, newResOpts] = modifyMockForMockyeahFetch(app, _match, _resOpts, method);

    app.log(['serve', 'mount', method], match.url || match.path);

    return mockyeahFetch.methods[method](match, newResOpts);
  });

  app.mock = app.locals.mockyeahFetch.mock;
  app.unmock = app.locals.mockyeahFetch.unmock;

  app.locals.expect = mockyeahFetch.expect;

  app.use('/', proxyRoute);

  app.proxy = on => {
    app.locals.proxying = typeof on !== 'undefined' ? on : true;
  };

  const eventEmitter = new EventEmitter();

  app.on = eventEmitter.on.bind(eventEmitter);
  app.emit = eventEmitter.emit.bind(eventEmitter);

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

  return app;
};
