const makeReset = app => {
  const reset = () => {
    app.routeManager.reset();
    app.locals.playingSuites = [];
    app.locals.playingAll = false;
    app.locals.proxying = app.config.proxy;
    app.middlewares = [];
  };

  return reset;
};

module.exports = makeReset;
