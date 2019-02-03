const _ = require('lodash');
const chokidar = require('chokidar');
const clearModule = require('clear-module');

const restart = app => {
  const { suitesDir, fixturesDir } = app.config;

  app.log(['watch'], 'restarting');

  clearModule.match(new RegExp(suitesDir));
  clearModule.match(new RegExp(fixturesDir));

  const wasPlayingSuites = app.locals.playingSuites;
  const wasPlayingAll = app.locals.playingAll;

  app.reset();

  if (wasPlayingAll) {
    app.playAll();
  } else {
    wasPlayingSuites.forEach(name => {
      app.play(name);
    });
  }
};

const makeWatch = app => {
  const { suitesDir, fixturesDir } = app.config;

  let first = true;

  const debounced = _.debounce(() => {
    if (first) {
      first = false;
      return;
    }

    restart(app);
  }, 500);

  const watch = () => {
    const watcher = chokidar.watch([suitesDir, fixturesDir]).on('all', debounced);
    app.locals.watcher = watcher;
  };

  return watch;
};

// Exposed only for testing.
// eslint-disable-next-line no-underscore-dangle
makeWatch.__restart = restart;

module.exports = makeWatch;
