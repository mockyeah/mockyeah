const path = require('path');
const { resolveFilePath } = require('./lib/helpers');

module.exports = app => name => {
  const { capturesDir } = app.config;
  const capturePath = path.join(capturesDir, name);
  const filePath = resolveFilePath(capturePath, 'index.js');
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const captures = require(filePath);

  app.log(['serve', 'play'], name);

  captures.map(capture => app.routeManager.all(...capture));
};
