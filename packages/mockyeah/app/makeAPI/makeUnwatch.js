const makeUnwatch = app => {
  const unwatch = () => {
    const { watcher } = app.locals;

    if (!watcher) return;

    watcher.close();

    app.log('watch', 'stopped watching');
  };

  return unwatch;
};

module.exports = makeUnwatch;
