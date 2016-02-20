'use strict';

const App = require('../app');

module.exports = function Server(config) {
  config = require('./config')(config);

  const app = new App(config);

  const server = app.listen(config.port, config.host, function listen() {
    app.log('serve', `Listening at http://${this.address().address}:${this.address().port}`);
  });

  const close = server.close.bind(server, function callback() {
    app.log(['serve', 'exit'], 'Goodbye.');
  });

  const use = function use() {
    app.use.apply(app, arguments)
  };

  return Object.assign({ server }, app.routeManager, { use, config, close });
};
