'use strict';

const server = require('./server');

server.app.listen('4001', function listen() {
  const host = this.address().address;
  const port = this.address().port;

  /* eslint-disable no-console */
  console.log('Mock Yeah listening at http://%s:%s', host, port);
  /* eslint-enable no-console */
});