#!/usr/bin/env node
'use strict';

/* eslint-disable no-console, no-sync */

/**
 * `mockyeah ls` lists service recordings.
 */

const fs = require('fs');
const program = require('commander');
const boot = require('../lib/boot');

program
  .parse(process.argv);

boot((env) => {
  fs.readdirSync(env.config.capturesDir).sort().filter((file) => console.log('  ' + file));
});