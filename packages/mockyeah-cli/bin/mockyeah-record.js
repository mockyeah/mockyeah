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
const querystring = require('querystring');

// TODO: write tests for this
const collectHeaders = (val, memo = {}) => {
  const pair = val.split(/\s*:\s*/);
  const key = pair[0];
  const value = pair[1];
  memo[key] = value;
  return memo;
};

const collectCommaSeparated = (val, memo = []) => [...memo, ...val.split(',').map(v => v.trim())];

const collect = (val, memo = []) => [...memo, val.trim()];

program
  .option(
    '-g, --groups [name]',
    'record with these named groups from configuration (comma-separated and/or repeatable)',
    collectCommaSeparated
  )
  .option(
    '-o, --only [regex]',
    'only record calls to URLs matching given regex pattern (repeatable)',
    collect
  )
  .option('-h, --use-headers', 'record headers to response options')
  .option('-l, --use-latency', 'record latency to response options')
  .option(
    '-H, --header [pair]',
    'record matches will require these headers ("Name: Value") (repeatable)',
    collectHeaders
  )
  .option('-v, --verbose', 'verbose output')
  .parse(process.argv);

const recordStopCallback = err => {
  if (err) console.error(err);
  process.exit(err ? 1 : 0);
};

const withName = (env, name, options = {}) => {
  const { adminUrl } = env;

  const qs = querystring.stringify({
    name,
    options: JSON.stringify(options)
  });

  let remote;
  request.get(`${adminUrl}/record?${qs}`, err => {
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
      ]
    ).then(() => {
      if (remote) {
        request.get(`${adminUrl}/record-stop`, recordStopCallback);
      } else {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(env.modulePath).recordStop(recordStopCallback);
      }
    });
  });
};

// Prepare options
global.MOCKYEAH_VERBOSE_OUTPUT = Boolean(program.verbose);

boot(env => {
  const [name] = program.args;
  const { groups, only, header, useHeaders, useLatency } = program;

  env.program = program;

  const options = {
    groups,
    only,
    headers: header,
    useHeaders,
    useLatency
  };

  if (!name) {
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'name',
          message: 'Recording name:'
        }
      ]
    ).then(answers => {
      if (!answers.name.length) {
        console.log(chalk.red('Recording name required'));
        process.exit(1);
      }

      withName(env, answers.name, options);
    })
  } else {
    withName(env, name, options);
  }
});
