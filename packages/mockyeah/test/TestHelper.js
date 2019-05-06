'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

global.MOCKYEAH_ROOT = __dirname;
global.MOCKYEAH_SUPPRESS_OUTPUT = true;
global.MOCKYEAH_VERBOSE_OUTPUT = false;

const Server = require('../server');

const mockyeah = new Server({
  root: __dirname
});

const request = require('supertest');

const configHttps = Object.assign({}, mockyeah.config, {
  port: undefined,
  portHttps: 4443,
  adminPort: 4773
});
const mockyeahHttps = new Server(configHttps);

after(() => Promise.all([mockyeah.close(), mockyeahHttps.close()]));

afterEach(() => {
  mockyeah.reset();
  mockyeahHttps.reset();
});

exports.mockyeah = mockyeah;
exports.mockyeahHttps = mockyeahHttps;
exports.request = request(mockyeah.server);
exports.requestHttps = request(mockyeahHttps.server);
