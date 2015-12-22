'use strict';

const express = require('express');
const app = express();
const RouteManager = require('./lib/RouteManager');

/**
 * Initialize RouteResolver with app
 *  App is needed for unregistering routes on teardown
 */
require('./lib/RouteResolver')(app);

/**
 * Attach RouteManager to app object
 *  RouteManager serves as the primary set of Mock Yeah api methods
 */
app.RouteManager = RouteManager;

app.get('/', (req, res) => {
  res.send('Hello, Mock Yeah!');
});

module.exports.app = app;