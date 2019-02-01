const makeUnwatch = app => {
  const unwatch = () => {
    const { watcher } = app.locals;

    if (!watcher) return;

    watcher.close();
  };

  return unwatch;
};

module.exports = makeUnwatch;
