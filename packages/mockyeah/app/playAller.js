const fs = require('fs');
const path = require('path');

module.exports = app => () => {
  const { suitesDir } = app.config;

  app.log(['serve'], 'play all');

  fs.readdir(suitesDir, (err, files) => {
    if (err) throw err;

    const dirs = files.filter(file =>
      // eslint-disable-next-line no-sync
      fs.statSync(path.join(suitesDir, file)).isDirectory()
    );

    dirs.forEach(file => {
      app.play(file);
    });

    app.locals.playingAll = true;
  });
};
