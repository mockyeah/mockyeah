'use strict';

global.MOCK_YEAH_ROOT = __dirname;

const request = require('supertest');
const mockyeah = require('../index.js');

after(() => {
  mockyeah.close();
});

module.exports.mockyeah = mockyeah;
module.exports.request = request('http://localhost:4041');