const { requireSuite } = require('../lib/helpers');

const makePlay = app => {
  const play = name => {
    const suite = requireSuite(app, name);

    if (!suite) return;

    app.locals.playingSuites.push(name);

    app.log(['serve', 'play'], name);

    suite.map((c, i) => app.routeManager.all(...c, {
      suiteName: name,
      suiteIndex: i
    }));
  };

  return play;
};

module.exports = makePlay;
