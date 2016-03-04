'use strict';
/* eslint-disable no-sync */

const Server = require('./server');
const config = require('./config');

module.exports = new Server(config);