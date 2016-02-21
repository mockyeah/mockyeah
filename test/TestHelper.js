'use strict';

global.MOCKYEAH_ROOT = __dirname;
global.MOCKYEAH_SUPPRESS_OUTPUT = true;
global.MOCKYEAH_VERBOSE_OUTPUT = false;

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