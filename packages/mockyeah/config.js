'use strict';

/* eslint-disable no-sync */

const cosmiconfig = require('cosmiconfig');
const prepareConfig = require('./lib/prepareConfig');
const relativeRoot = require('./lib/relativeRoot');

const moduleName = 'mockyeah';

const searchPlaces = ['package.json', `.${moduleName}`, `.${moduleName}.js`, `.${moduleName}.json`];

const explorer = cosmiconfig(moduleName, {
  searchPlaces
});

let searchedFor;
try {
  searchedFor = explorer.searchSync(relativeRoot);
} catch (error) {
  throw new Error(`Error searching for configuration file: ${error.message}`);
}

const { filepath } = searchedFor || {};

let config;

if (filepath) {
  try {
    const loaded = explorer.loadSync(filepath);
    // eslint-disable-next-line prefer-destructuring
    config = loaded.config;
  } catch (error) {
    throw new Error(`Error loading configuration file "${filepath}": ${error.message}`);
  }
}

module.exports = prepareConfig(config);
