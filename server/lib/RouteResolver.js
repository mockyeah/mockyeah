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
    let send;

    // Default latency to 0 when undefined
    response.latency = response.latency || 0;

    // Default response status to 200 when undefined
    res.status(response.status || 200);

    // set response headers, if received
    if (response.headers) res.set(response.headers);

    if (response.filePath) { // if filePath, send file
      if (response.type) res.type(response.type);
      send = res.sendFile.bind(res, path.resolve(response.filePath));
    } else if (response.fixture) { // if fixture, send fixture file
      if (response.type) res.type(response.type);
      fixturesDir = fixturesDir || app.config.fixturesDir;
      send = res.sendFile.bind(res, path.resolve(fixturesDir, response.fixture));
    } else if (response.html) { // if html, set Content-Type to application/html and send
      res.type(response.type || 'html');
      send = res.send.bind(res, response.html);
    } else if (response.json) { // if json, set Content-Type to application/json and send
      res.type(response.type || 'json');
      send = res.send.bind(res, response.json);
    } else if (response.text) { // if text, set Content-Type to text/plain and send
      res.type(response.type || 'text');
      send = res.send.bind(res, response.text);
    } else { // else send empty response
      res.type(response.type || 'text');
      send = res.send.bind(res);
    }

    setTimeout(send, response.latency);
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