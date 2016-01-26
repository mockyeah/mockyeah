'use strict';
/* eslint-disable no-console */

const app = require('./server').app;
const middleware = require('./server/middleware');
app.config = require('./config');

if (app.config.get('accessControlAllowOrigin')) {
  app.use(middleware.accessControlAllowOrigin);
}

if (app.config.get('verbose')) {
  app.use(middleware.logRequest);
}

const httpServer = app.listen(app.config.get('port'), function listen() {
  const host = this.address().address;
  const port = this.address().port;

  console.log(`Mock Yeah listening at http://${host}:${port}`);
});

module.exports = app.RouteManager;

module.exports.close = httpServer.close.bind(httpServer, function callback() {
  console.log('Mock Yeah server closed.');
});
