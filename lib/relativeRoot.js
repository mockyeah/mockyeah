'use strict';

const path = require('path');

const wrappingProjectRoot = path.resolve(__dirname, '../../..');

/**
 * Determine wrapping application root
 *  Needed for searching for .mockyeah configuration file.
 */
module.exports = global.MOCKYEAH_ROOT ? global.MOCKYEAH_ROOT : wrappingProjectRoot;