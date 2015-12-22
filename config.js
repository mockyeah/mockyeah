'use strict';

const path = require('path');
const config = require('nconf');

/**
 * Determine wrapping application root
 *  Needed for searching for .mock-yeah configuration file.
 */
const root = path.resolve(__dirname, global.MOCK_YEAH_ROOT ? global.MOCK_YEAH_ROOT : '..');

config.file({
  file: '.mock-yeah',
  dir: root,
  search: true
})
.defaults({
  port: 4001,
  fixturesDir: './fixtures'
});

module.exports = config;