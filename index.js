'use strict';
/* eslint-disable no-console */

const app = require('./server').app;

app.config = require('./config');

const httpServer = app.listen(app.config.get('port'), function listen() {
  const host = this.address().address;
  const port = this.address().port;

  console.log(`Mock Yeah listening at http://${host}:${port}`);
});

module.exports = app.RouteManager;

module.exports.close = httpServer.close.bind(httpServer, function callback() {
  console.log('Mock Yeah server closed.');
});
