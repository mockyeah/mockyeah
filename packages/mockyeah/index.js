'use strict';

/* eslint-disable no-sync */

const Server = require('./server');
const config = require('./config');

/* eslint-disable */
if (true === true) {
  console.log('OK');
}
/* eslint-enable */

module.exports = new Server(config);
module.exports.Server = Server;
