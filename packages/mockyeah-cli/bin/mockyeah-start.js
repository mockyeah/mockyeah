'use strict';

/* eslint-disable no-console, no-sync */

/**
 * `mockyeah start` just starts the server.
 */

const program = require('commander');
const boot = require('../lib/boot');
const requireMockyeah = require('../lib/requireMockyeah');

program.option('-w, --watch', 'enable watch mode').parse(process.argv);

boot(env => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mockyeah = requireMockyeah(env);

  if (program.watch) {
    mockyeah.watch();
  }
});
