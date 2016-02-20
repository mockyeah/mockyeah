'use strict';

const configDefaults = {
  name: 'mockyeah',
  host: 'localhost',
  port: 4001,
  fixturesDir: './mockyeah/fixtures'
};

module.exports = (config) => {
  return Object.assign({}, configDefaults, config || {});
};
