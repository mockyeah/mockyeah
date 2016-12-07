'use strict';

const App = require('../app');
const prepareConfig = require('../lib/prepareConfig');
const cors = require('cors');
/**
 * Server module
 * @param  {Object} config Application configuration.
 * @return {Instances} Instance of a http server.
 */
module.exports = function Server(config, onStart) {
  config = prepareConfig(config);

  // Instantiate an application
  const app = new App(config);

  // Enable CORS for all routes
  app.use(cors());

  // Start server on conigured hose and port
  const server = app.listen(config.port, config.host, function listen() {
    this.rootUrl = `http://${this.address().address}:${this.address().port}`;
    app.log('serve', `Listening at ${this.rootUrl}`);
    // Execute callback once server starts
    if (onStart) onStart.call(this);
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
