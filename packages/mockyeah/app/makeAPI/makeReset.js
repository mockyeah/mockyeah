const makeReset = app => {
  const reset = () => {
    app.locals.mockyeahFetch.reset();
    app.locals.playingSuites = [];
    app.locals.playingAll = false;
    app.locals.proxying = app.config.proxy;
  };

  return reset;
};

module.exports = makeReset;
