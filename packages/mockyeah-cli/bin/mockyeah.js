'use strict';

/**
 * mockyeah cli api "table of contents".
 * Root `mockyeah` command does not invoke behavior other than
 * providing user with a catalog of available actions.
 */

const program = require('commander');
const boot = require('../lib/boot');
const version = require('../version');

boot(() => {
  program
    .name('mockyeah')
    .version(version)
    .command('list', 'list suites')
    .alias('ls')
    .command('play [suiteNames]', 'play suite(s)')
    .command('playAll', 'play all suites')
    .alias('play-all')
    .command('record [suiteName]', 'record suite')
    .command('start', 'start server')
    .parse(process.argv);
});
