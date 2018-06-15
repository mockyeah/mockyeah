'use strict';
/* eslint-disable no-console, no-process-exit, no-sync */

const Liftoff = require('liftoff');
const v8flags = require('v8flags');
const chalk = require('chalk');

const liftoff = new Liftoff({
  name: 'mockyeah',
  configName: '.mockyeah',
  extensions: {
    '': null
  },
  v8flags
});

module.exports = function boot(callback) {
  liftoff.launch({}, (env) => {
    // check for local mockyeah
    if (!env.modulePath) {
      console.log(chalk.red('Local mockyeah not found in ' + env.cwd));
      console.log(chalk.red('Try running: npm install mockyeah --save-dev'));
      process.exit(1);
    }

    env.config = require('./config')(env);

    callback.call(this, env);
  });
};