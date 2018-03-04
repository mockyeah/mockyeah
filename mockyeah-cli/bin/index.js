#!/usr/bin/env node
'use strict';

/**
 * mockyeah cli api "table of contents".
 * Root `mockyeah` command does not invoke behavior other than
 * providing user with a catalog of available actions.
 */

const program = require('commander');
const version = require('../version');

program
  .version(version)
  .command('ls', 'list service captures')
  .command('play [name]', 'play service capture')
  .command('record [name]', 'record service capture')
  .parse(process.argv);