const { requireSuite } = require('./lib/helpers');

module.exports = app => name => {
  const suite = requireSuite(app, name);

  if (!suite) return;

  app.locals.playingSuites.push(name);

  app.log(['serve', 'play'], name);

  suite.map(c => app.routeManager.all(...c));
};
