#!/usr/bin/env node
'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

/**
 * `mockyeah play` development server api.
 */

const fs = require('fs');
const path = require('path');
const program = require('commander');
const boot = require('../lib/boot');
const inquirer = require('inquirer');
const chalk = require('chalk');
const tildify = require('tildify');
let name;

program
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv);

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);
name = program.args[0];

boot((env) => {
  const capturesDir = env.config.capturesDir;
  let captureNames;

  try {
    captureNames = fs.readdirSync(capturesDir).filter((file) => {
      return fs.statSync(path.join(capturesDir, file)).isDirectory();
    });
  } catch (err) {
    console.log(chalk.red('Capture directory not found at ' + tildify(capturesDir)));
    process.exit(1);
  }

  if (!captureNames.length) {
    console.log(chalk.red('No captures available to start'));
    console.log(chalk.red('Record one by running: mockyeah record [name]'));
    process.exit(0);
  }

  if (!name) {
    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: 'Choose a recording to play:',
        choices: captureNames
      }
    ], answers => {
      require(env.modulePath).play(answers.name);
    });
  }

  if (name) {
    require(env.modulePath).play(name);
  }
});