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

  if (app.config.watch) {
    watch();
  }

  return watch;
};

makeWatch.restart = restart;

module.exports = makeWatch;
