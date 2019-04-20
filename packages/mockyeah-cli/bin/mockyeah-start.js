'use strict';

/* eslint-disable no-console, no-sync */

/**
 * `mockyeah start` just starts the server.
 */

const program = require('commander');
const boot = require('../lib/boot');

program
  .option('-w, --watch', 'enable watch mode')
  .parse(process.argv);

boot(env => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mockyeah = require(env.modulePath);

  if (program.watch) {
    mockyeah.watch();
  }
});
