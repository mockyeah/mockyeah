'use strict';

const chalk = require('chalk');

const checkVersionMatch = (env, pkgUp) => {
  if (!pkgUp || !pkgUp.package || !pkgUp.package.version) {
    throw new Error(
      chalk.red('Could not find `mockyeah-cli` package version to check against core.')
    );
  }

  if (!env.modulePackage || !env.modulePackage.version) {
    throw new Error(chalk.red('Could not find `mockyeah` package version to check against CLI.'));
  }

  const cliVersion = pkgUp.package.version;
  const coreVersion = env.modulePackage.version;

  if (cliVersion !== coreVersion) {
    throw new Error(
      chalk.red(
        `Version mismatch between CLI (${cliVersion}) and core (${coreVersion}) - please install same versions.`
      )
    );
  }
};

module.exports = checkVersionMatch;
