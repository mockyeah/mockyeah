'use strict';

const server = require('./server');

server.app.config = require('./config');

server.app.listen(server.app.config.get('port'), function listen() {
  const host = this.address().address;
  const port = this.address().port;

  /* eslint-disable no-console */
  console.log('Mock Yeah listening at http://%s:%s', host, port);
  /* eslint-enable no-console */
});