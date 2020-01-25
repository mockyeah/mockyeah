'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

const Liftoff = require('liftoff');
const v8flags = require('v8flags');
const chalk = require('chalk');
const readPkgUp = require('read-pkg-up');
const checkVersionMatch = require('./checkVersionMatch');

const liftoff = new Liftoff({
  name: 'mockyeah',
  moduleName: '@mockyeah/server',
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
      console.log(chalk.yellow(`Local \`@mockyeah/server\` not found in ${env.cwd}`));
      console.log(chalk.yellow('Using global `@mockyeah/server`'));
      console.log(chalk.yellow('To pin to a version, run: npm add --save-dev @mockyeah/cli'));
    } else {
      getPackageAndCheckVersionMatch(env);
    }

    // eslint-disable-next-line global-require
    env.config = require('./config')(env);

    // TODO: Implement support for HTTPS admin server protocol.

    const { adminProtocol, adminHost, adminPort } = env.config;

    env.adminUrl = `${adminProtocol}://${adminHost}:${adminPort}`;

    callback.call(this, env);
  });
};
