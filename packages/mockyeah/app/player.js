const { requireSuite } = require('./lib/helpers');

module.exports = app => name => {
  const capture = requireSuite(app, name);

  if (!capture) return;

  app.log(['serve', 'play'], name);

  capture.map(c => app.routeManager.all(...c));
};
