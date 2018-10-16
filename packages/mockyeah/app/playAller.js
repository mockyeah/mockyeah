const fs = require('fs');
const path = require('path');

module.exports = app => () => {
  const { capturesDir } = app.config;

  app.log(['serve', 'play all']);

  fs.readdir(capturesDir, (err, files) => {
    if (err) throw err;

    const dirs = files.filter(file =>
      // eslint-disable-next-line no-sync
      fs.statSync(path.join(capturesDir, file)).isDirectory()
    );

    // if (!captureNames.length) {
    //   console.log(chalk.red('No captures available to start'));
    //   console.log(chalk.red('Record one by running: mockyeah record [name]'));
    //   throw new Error('');
    // }

    dirs.forEach(file => {
      app.play(file);
    });
  });
};
