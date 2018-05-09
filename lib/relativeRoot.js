'use strict';

const path = require('path');

const wrappingProjectRoot = path.join(__dirname, '..', '..', '..');

const globalRoot = process.env.MOCKYEAH_ROOT || global.MOCKYEAH_ROOT;

/**
 * Determine wrapping application root
 *  Needed for searching for .mockyeah configuration file.
 */
module.exports = path.resolve(globalRoot || wrappingProjectRoot);
