'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

/**
 * `mockyeah play` development server api.
 */

const fs = require('fs');
const path = require('path');
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const request = require('request');
const boot = require('../lib/boot');

program
  .arguments('[suiteNames]')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv);

const withNames = (env, names) => {
  const { adminUrl } = env;

  request.get(`${adminUrl}/play?name=${names.join(',')}`, err => {
    if (err) {
      // TODO: Detect errors that shouldn't result in local fallback.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(env.modulePath).play(names);
    }
  });
};

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);

boot(env => {
  const names = program.args;

  const { suitesDir } = env.config;
  let suiteNames;

  try {
    suiteNames = fs
      .readdirSync(suitesDir)
      .filter(file => fs.statSync(path.join(suitesDir, file)).isDirectory());
  } catch (err) {
    console.log(chalk.red(`Suite directory not found at ${suitesDir}`));
    process.exit(1);
  }

  if (!suiteNames.length) {
    console.log(chalk.red('No suites available to start'));
    console.log(chalk.red('Record one by running: mockyeah record [suiteName]'));
    process.exit(0);
  }

  if (!names.length) {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Choose a suite to play:',
          choices: suiteNames
        }
      ])
      .then(answers => {
        withNames(env, [answers.name]);
      });
  } else {
    withNames(env, names);
  }
});
