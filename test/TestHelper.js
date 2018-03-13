'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

global.MOCKYEAH_ROOT = __dirname;
global.MOCKYEAH_SUPPRESS_OUTPUT = true;
global.MOCKYEAH_VERBOSE_OUTPUT = false;

const mockyeah = require('../index.js');
const request = require('supertest');

const configHttps = Object.assign({}, mockyeah.config, {
  port: undefined,
  portHttps: 4443
});
const mockyeahHttps = new mockyeah.Server(configHttps);

after(() => {
  mockyeah.close();
  mockyeahHttps.close();
});

afterEach(() => {
  mockyeah.reset();
  mockyeahHttps.reset();
});

exports.mockyeah = mockyeah;
exports.mockyeahHttps = mockyeahHttps;
exports.request = request(mockyeah.server);
exports.requestHttps = request(mockyeahHttps.server);
