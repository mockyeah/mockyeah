'use strict';

const path = require('path');

const wrappingProjectRoot = path.join(__dirname, '..', '..', '..');
const relativeRoot = process.env.MOCKYEAH_ROOT || global.MOCKYEAH_ROOT || wrappingProjectRoot;

/**
 * Determine wrapping application root
 *  Needed for searching for .mockyeah configuration file.
 */
module.exports = path.resolve(relativeRoot);
