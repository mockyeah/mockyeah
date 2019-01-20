const _ = require('lodash');
const chokidar = require('chokidar');
const clearModule = require('clear-module');

const watcher = app => {
  const { capturesDir, fixturesDir } = app.config;

  let first = true;
  const debounced = _.debounce(() => {
    if (first) {
      first = false;
      return;
    }

    clearModule.match(new RegExp(capturesDir));
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
  }, 500);

  const watch = () => {
    chokidar.watch([capturesDir, fixturesDir]).on('all', debounced);
  };

  if (app.config.watch) {
    watch();
  }

  return watch;
};

module.exports = watcher;
