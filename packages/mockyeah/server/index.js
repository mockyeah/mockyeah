'use strict';

const cors = require('cors');
const https = require('https');
const fs = require('fs');
const createCertFiles = require('create-cert-files');
const { partial } = require('lodash');
const async = require('async');
const App = require('../app');
const prepareConfig = require('../lib/prepareConfig');
const AdminServer = require('./admin');

const isErrorServerNotRunning = error =>
  error && (error.code === 'ERR_SERVER_NOT_RUNNING' || error.message.includes('Not running'));

/**
 * Server module
 * @param  {Object} config Application configuration.
 * @return {Instances} Instance of a http server.
 */
module.exports = function Server(config, onStart) {
  config = prepareConfig(config);

  // Instantiate an application
  const app = new App(config);

  app.log('initialized', false);

  // Enable CORS for all routes
  app.use(cors());

  let start;

  let server;
  let adminServer;

  const startedPromise = new Promise((resolve, reject) => {
    let lazyOnStart;

    const handleError = error => {
      setTimeout(() => {
        reject(error);
        if (onStart) onStart.call(this, error);
        if (lazyOnStart) lazyOnStart.call(this, error);
      });
    };

    const listen = function listener(secure, error) {
      if (error) {
        handleError(error);
        return;
      }
      const host = config.host || this.address().address;
      this.rootUrl = `http${secure ? 's' : ''}://${host}:${this.address().port}`;
      app.log('serve', `Listening at ${this.rootUrl}`);
      // Execute callback once server starts
      setTimeout(() => {
        resolve();
        if (onStart) onStart.call(this);
        if (lazyOnStart) lazyOnStart.call(this);
      });
    };

    const startServer = () => {
      if (config.portHttps) {
        let certFiles;
        if (!config.httpsKeyPath && !config.httpsCertPath) {
          certFiles = createCertFiles();
        } else {
          certFiles = {
            key: config.httpsKeyPath,
            cert: config.httpsCertPath
          };
        }

        /* eslint-disable no-sync */
        const key = fs.readFileSync(certFiles.key);
        const cert = fs.readFileSync(certFiles.cert);
        /* eslint-enable no-sync */

        const credentials = {
          key,
          cert
        };

        const httpsServer = https.createServer(credentials, app);

        try {
          server = httpsServer.listen(config.portHttps, config.host, partial(listen, true));
        } catch (error) {
          handleError(error);
        }
      } else {
        try {
          server = app.listen(config.port, config.host, partial(listen, false));
        } catch (error) {
          handleError(error);
        }
      }

      server.on('error', handleError);
    };

    const startAdminServer = () => {
      const admin = new AdminServer(config, app);
      adminServer = admin.listen(config.adminPort, config.adminHost, function adminListen() {
        const host = config.adminHost || this.address().address;
        adminServer.rootUrl = `http://${host}:${this.address().port}`;
        app.log(['serve', 'admin'], `Admin server listening at ${adminServer.rootUrl}`);
      });
    };

    start = argLazyOnStart => {
      lazyOnStart = argLazyOnStart;

      startServer();

      if (config.adminServer) {
        startAdminServer();
      }

      return startedPromise;
    };
  });

  if (config.start) {
    start();
  }

  // Expose ability to implement middleware via API
  const use = function use() {
    app.use.apply(app, arguments);
  };

  // Expose ability to stop server via API
  const close = function close(done) {
    return new Promise((resolve, reject) => {
      const doneAndResolve = err => {
        if (done) done(err);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      const tasks = [
        cb =>
          server.close(err => {
            app.log(['serve', 'exit'], 'Goodbye.');
            if (isErrorServerNotRunning(err)) cb();
            else cb(err);
          }),
        adminServer &&
          (cb =>
            adminServer.close(err => {
              app.log(['admin', 'serve', 'exit'], 'Goodbye.');
              if (isErrorServerNotRunning(err)) cb();
              else cb(err);
            }))
      ].filter(Boolean);

      startedPromise.then(() => async.parallel(tasks, doneAndResolve));
    });
  };

  const shutdown = done => {
    app.unwatch();
    return close(done);
  };

  const { proxy, reset, play, playAll, record, recordStop, watch, unwatch } = app;

  // Construct and return mockyeah API
  return Object.assign({}, app.routeManager, {
    adminServer,
    close,
    config,
    play,
    playAll,
    proxy,
    record,
    recordStop,
    reset,
    server,
    shutdown,
    start,
    startedPromise,
    unwatch,
    use,
    watch
  });
};
