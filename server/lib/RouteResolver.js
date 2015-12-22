'use strict';

/**
 * RouteResolver
 *  Facilitates route registration and unregistration.
 *  Implements Express route middleware based on Mock Yeah API options.
 */

const path = require('path');
const _ = require('lodash');
let app;
let fixturesDir;

const handler = function handler(response) {
  response = response || {};
  return (req, res) => {
    res.status(response.status || 200);

    // set response headers, if received
    if (response.headers) res.set(response.headers);

    if (response.filePath) { // if filePath, send filedefaultResponseType('json');
      if (response.type) res.type(response.type);
      res.sendFile(path.resolve(response.filePath));
    } else if (response.fixture) { // if fixture, send fixture file
      if (response.type) res.type(response.type);
      fixturesDir = fixturesDir || app.config.get('fixturesDir');
      res.sendFile(path.resolve(fixturesDir, response.fixture));
    } else if (response.html) { // if html, set Content-Type to application/html and send
      res.type(response.type || 'html');
      res.send(response.html);
    } else if (response.json) { // if json, set Content-Type to application/json and send
      res.type(response.type || 'json');
      res.send(response.json);
    } else if (response.text) { // if text, set Content-Type to text/plain and send
      res.type(response.type || 'text');
      res.send(response.text);
    } else { // else send empty response
      res.type(response.type || 'text');
      res.send();
    }
  };
};

module.exports = function RouteResolver(_app) {
  app = _app;
};

module.exports.register = function register(route) {
  if (!_.isFunction(route.response)) {
    route.response = handler(route.response);
  }

  app[route.method](route.path, route.response);
};

module.exports.unregister = function unregister(routes) {
  const routePaths = routes.map((route) => { return route.path; });

  app._router.stack = app._router.stack.filter((layer) => {
    return !(layer.route && routePaths.indexOf(layer.route.path) >= 0);
  });
};