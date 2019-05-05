#!/usr/bin/env node

'use strict';

/**
 * mockyeah cli api "table of contents".
 * Root `mockyeah` command does not invoke behavior other than
 * providing user with a catalog of available actions.
 */

const program = require('commander');
const boot = require('../lib/boot');
const version = require('../version');

program.parse(process.argv);

boot(() => {
  program
    .version(version)
    .command('ls', 'list suites')
    .command('play [suiteNames]', 'play suite(s)')
    .command('playAll', 'play all suites')
    .command('record [suiteName]', 'record suite')
    .command('start', 'start server')
    .parse(process.argv);
});
