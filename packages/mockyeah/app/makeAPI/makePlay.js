const { requireSuite } = require('../lib/helpers');

const makePlay = app => {
  const play = name => {
    const suite = requireSuite(app, name);

    if (!suite) return;

    app.locals.playingSuites.push(name);

    app.log(['serve', 'play'], name);

    suite.map(c => app.routeManager.all(...c));
  };

  return play;
};

module.exports = makePlay;
