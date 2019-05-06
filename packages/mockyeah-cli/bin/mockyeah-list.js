'use strict';

/* eslint-disable no-console, no-sync */

/**
 * `mockyeah list` lists suites.
 */

const fs = require('fs');
const program = require('commander');
const boot = require('../lib/boot');

program.parse(process.argv);

boot(env => {
  fs.readdirSync(env.config.suitesDir)
    .sort()
    .filter(file => console.log(`  ${file}`));
});
