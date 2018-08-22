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

  const { capturesDir } = env.config;
  let captureNames;

  try {
    captureNames = fs
      .readdirSync(capturesDir)
      .filter(file => fs.statSync(path.join(capturesDir, file)).isDirectory());
  } catch (err) {
    console.log(chalk.red(`Capture directory not found at ${capturesDir}`));
    process.exit(1);
  }

  if (!captureNames.length) {
    console.log(chalk.red('No captures available to start'));
    console.log(chalk.red('Record one by running: mockyeah record [name]'));
    process.exit(0);
  }

  if (!name) {
    inquirer.prompt(
      [
        {
          type: 'list',
          name: 'name',
          message: 'Choose a recording to play:',
          choices: captureNames
        }
      ],
      answers => {
        withName(env, answers.name);
      }
    );
  } else {
    withName(env, name);
  }
});
