'use strict';

const chalk = require('chalk');
const semver = require('semver');

const checkVersionMatch = (env, pkgUp) => {
  if (!pkgUp || !pkgUp.package || !pkgUp.package.version) {
    throw new Error(
      chalk.red('Could not find `@mockyeah/cli` package version to check against core.')
    );
  }

  if (!env.modulePackage || !env.modulePackage.version) {
    throw new Error(chalk.red('Could not find `mockyeah` package version to check against CLI.'));
  }

  const cliVersion = pkgUp.package.version;
  const serverVersion = env.modulePackage.version;

  const diff = semver.diff(cliVersion, serverVersion);

  if (['minor', 'major', 'preminor', 'premajor'].includes(diff)) {
    throw new Error(
      chalk.red(
        `Version mismatch between @mockyeah/cli@${cliVersion} and @mockyeah/server@${serverVersion} - please install compatible versions.`
      )
    );
  }
};

module.exports = checkVersionMatch;
