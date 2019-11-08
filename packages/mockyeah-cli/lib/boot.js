'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

const Liftoff = require('liftoff');
const v8flags = require('v8flags');
const chalk = require('chalk');
const readPkgUp = require('read-pkg-up');
const checkVersionMatch = require('./checkVersionMatch');

const liftoff = new Liftoff({
  name: 'mockyeah',
  configName: '.mockyeah',
  extensions: {},
  v8flags
});

const getPackageAndCheckVersionMatch = env => {
  const pkgUp = readPkgUp.sync({
    cwd: __dirname
  });

  checkVersionMatch(env, pkgUp);
};

module.exports = function boot(callback) {
  liftoff.launch({}, env => {
    // check for local mockyeah
    if (!env.modulePath) {
      console.log(chalk.red(`Local mockyeah not found in ${env.cwd}`));
      console.log(chalk.red('Try running: npm install @mockyeah/server --save-dev'));
      process.exit(1);
    }

    getPackageAndCheckVersionMatch(env);

    // eslint-disable-next-line global-require
    env.config = require('./config')(env);

    // TODO: Implement support for HTTPS admin server protocol.

    const { adminProtocol, adminHost, adminPort } = env.config;

    env.adminUrl = `${adminProtocol}://${adminHost}:${adminPort}`;

    callback.call(this, env);
  });
};
