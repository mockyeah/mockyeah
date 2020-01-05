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
const withAdminServer = require('./withAdminServer');

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

  const { play, playAll, proxy, record, recordStop, reset, watch, unwatch, mock, unmock } = app;

  // Construct and return mockyeah API
  const instance = Object.assign({}, app.locals.methods, {
    config,
    play,
    playAll,
    proxy,
    record,
    recordStop,
    reset,
    watch,
    unwatch,
    mock,
    unmock
  });

  instance.expect = app.locals.expect;

  instance.startedPromise = new Promise((resolve, reject) => {
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
      this.url = this.rootUrl;
      app.log('serve', `Listening at ${this.url}`);
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
          instance.server = httpsServer.listen(
            config.portHttps,
            config.host,
            partial(listen, true)
          );
        } catch (error) {
          handleError(error);
        }
      } else {
        try {
          instance.server = app.listen(config.port, config.host, partial(listen, false));
        } catch (error) {
          handleError(error);
        }
      }

      instance.server.on('error', handleError);
    };

    const startAdminServer = () => {
      const admin = new AdminServer(config, app);
      instance.adminServer = admin.listen(
        config.adminPort,
        config.adminHost,
        function adminListen() {
          const host = config.adminHost || this.address().address;
          instance.adminServer.rootUrl = `http://${host}:${this.address().port}`;
          instance.adminServer.url = instance.adminServer.rootUrl;
          app.log(['serve', 'admin'], `Admin server listening at ${instance.adminServer.url}`);
        }
      );
      withAdminServer({ app, instance });
    };

    instance.start = argLazyOnStart => {
      lazyOnStart = argLazyOnStart;

      startServer();

      if (config.adminServer) {
        startAdminServer();
      }

      return instance.startedPromise;
    };
  });

  // Expose ability to stop server via API
  instance.close = function close(done) {
    app.unwatch();

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
          instance.server.close(err => {
            app.log(['serve', 'exit'], 'Goodbye.');
            if (isErrorServerNotRunning(err)) cb();
            else cb(err);
          }),
        instance.adminServer &&
          (cb =>
            instance.adminServer.close(err => {
              app.log(['admin', 'serve', 'exit'], 'Goodbye.');
              if (isErrorServerNotRunning(err)) cb();
              else cb(err);
            }))
      ].filter(Boolean);

      instance.startedPromise.then(() => async.parallel(tasks, doneAndResolve));
    });
  };

  if (config.start) {
    instance.start();
  }

  return instance;
};
