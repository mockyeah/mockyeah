'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

/**
 * `mockyeah playAll` development server api.
 */

const fs = require('fs');
const program = require('commander');
const boot = require('../lib/boot');
const chalk = require('chalk');
const request = require('request');

program.option('-v, --verbose', 'verbose output').parse(process.argv);

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);

boot(env => {
  const { suitesDir } = env.config;

  try {
    const stat = fs.statSync(suitesDir);
    if (!stat.isDirectory()) throw new Error('Not a directory');
  } catch (err) {
    console.log(chalk.red(`Suite directory not found at ${suitesDir}`));
    process.exit(1);
  }

  const { adminUrl } = env;

  request.get(`${adminUrl}/playAll`, err => {
    if (err) {
      // TODO: Detect errors that shouldn't result in local fallback.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(env.modulePath).playAll();
    }
  });
});
