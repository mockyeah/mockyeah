#!/usr/bin/env node
'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

/**
 * `mockyeah record` development server api.
 */

const program = require('commander');
const boot = require('../lib/boot');
const inquirer = require('inquirer');
const chalk = require('chalk');
let name;

program
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv);

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);
name = program.args[0];

boot((env) => {
  if (!name) {
    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Recording name:'
      }
    ], answers => {
      if (!answers.name.length) {
        console.log(chalk.red('Recording name required'));
        process.exit(1);
      }
      require(env.modulePath).record(answers.name);
    });
  }

  if (name) {
    require(env.modulePath).record(name);
  }
});
