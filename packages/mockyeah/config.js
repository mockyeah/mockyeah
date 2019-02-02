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

const { filepath } = searchedFor;

if (!filepath) {
  throw new Error(`No configuration file found.`);
}

let loaded;
try {
  loaded = explorer.loadSync(filepath);
} catch (error) {
  throw new Error(`Error loading configuration file "${filepath}": ${error.message}`);
}

const { config } = loaded;

module.exports = prepareConfig(config);
