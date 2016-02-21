'use strict';

global.MOCKYEAH_ROOT = __dirname;
global.MOCKYEAH_SUPPRESS_OUTPUT = false;
global.MOCKYEAH_VERBOSE_OUTPUT = true;

const mockyeah = require('../index.js');
const request = require('supertest');

after(() => {
  mockyeah.close();
});

afterEach(() => {
  mockyeah.reset();
});

exports.mockyeah = mockyeah;
exports.request = request(mockyeah.server);