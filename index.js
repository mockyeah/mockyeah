'use strict';

const app = require('./app');
const log = require('./app/lib/Logger');

app.config = require('./config');

const httpServer = app.listen(app.config.port, app.config.host, function listen() {
  const host = this.address().address;
  const port = this.address().port;

  log('serve', `Listening at http://${host}:${port}`);
});

module.exports = app.RouteManager;

module.exports.config = app.config;

module.exports.close = httpServer.close.bind(httpServer, function callback() {
  log(['serve', 'exit'], 'Goodbye.');
});
