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
const request = require('request');

program.option('-v, --verbose', 'verbose output').parse(process.argv);

const withName = (env, name) => {
  const { adminUrl } = env;

  request.get(`${adminUrl}/play?name=${name}`, err => {
    if (err) {
      // TODO: Detect errors that shouldn't result in local fallback.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(env.modulePath).play(name);
    }
  });
};

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);

boot(env => {
  const name = program.args[0];

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
    console.log(chalk.red('Record one by running: mockyeah record [name]'));
    process.exit(0);
  }

  if (!name) {
    inquirer.prompt(
      [
        {
          type: 'list',
          name: 'name',
          message: 'Choose a suite to play:',
          choices: suiteNames
        }
      ]
    ).then(answers => {
      withName(env, answers.name);
    });
  } else {
    withName(env, name);
  }
});
