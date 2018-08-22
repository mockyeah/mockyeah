'use strict';

/* eslint-disable no-console, no-process-exit, no-sync */

/**
 * `mockyeah record` development server api.
 */

const program = require('commander');
const boot = require('../lib/boot');
const inquirer = require('inquirer');
const chalk = require('chalk');
const request = require('request');

program
  .option('-o, --only [regex]', 'only record calls to URLs matching given regex pattern')
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv);

const withName = (env, name, options = {}) => {
  const { adminUrl } = env;

  let remote;
  request.get(`${adminUrl}/record?name=${name}&options=${JSON.stringify(options)}`, err => {
    if (err) {
      remote = false;

      // TODO: Detect errors that shouldn't result in local fallback.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(env.modulePath).record(name, options);
    } else {
      remote = true;
    }

    inquirer.prompt(
      [
        {
          type: 'confirm',
          name: 'stop',
          message: 'Press enter when ready to stop recording.'
        }
      ],
      () => {
        if (remote) {
          request.get(`${adminUrl}/record-stop`, () => {});
        } else {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          require(env.modulePath).recordStop();
        }
      }
    );
  });
};

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);

boot(env => {
  const [name] = program.args;
  const { only } = program;

  env.program = program;

  if (!name) {
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'name',
          message: 'Recording name:'
        }
      ],
      answers => {
        if (!answers.name.length) {
          console.log(chalk.red('Recording name required'));
          process.exit(1);
        }

        withName(env, answers.name, { only });
      }
    );
  } else {
    withName(env, name, { only });
  }
});
