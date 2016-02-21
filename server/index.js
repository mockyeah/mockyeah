'use strict';

const App = require('../app');

/**
 * Server module
 * @param  {Object} config Application configuration.
 * @return {Instances} Instance of a http server.
 */
module.exports = function Server(config) {
  config = require('./config')(config);

  // Instantiate an application
  const app = new App(config);

  // Start server on conigured hose and port
  const server = app.listen(config.port, config.host, function listen() {
    app.log('serve', `Listening at http://${this.address().address}:${this.address().port}`);
  });

  // Expose ability to stop server via API
  const close = server.close.bind(server, function callback() {
    app.log(['serve', 'exit'], 'Goodbye.');
  });

  // Expose ability to implement middleware via API
  const use = function use() {
    app.use.apply(app, arguments);
  };

  // Construct and return mockyeah API
  return Object.assign({ server }, app.routeManager, { use, config, close });
};
