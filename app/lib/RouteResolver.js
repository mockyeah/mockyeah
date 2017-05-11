'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const expandPath = require('../../lib/expandPath');
const Expectation = require('./Expectation');
/**
 * RouteResolver
 *  Facilitates route registration and unregistration.
 *  Implements Express route middleware based on mockyeah API options.
 */
function RouteResolver(app) {
  this.app = app;
}

function validateResponse(response) {
  let payloadKeysPresent = 0;
  const payloadKeys = Object.keys(response);
  const expectedPayloadKeys = [
    'fixture',
    'filePath',
    'html',
    'json',
    'text',
    'status',
    'headers',
    'raw',
    'latency',
    'type'
  ];

  payloadKeys.forEach(key => {
    expectedPayloadKeys.forEach(expectedKey => { if (key === expectedKey) ++payloadKeysPresent; });
  });

  if (payloadKeysPresent.length > 1) {
    throw new Error(`Response options must not include more than one of the following: ${expectedPayloadKeys.join(', ')}`);
  }

  if (payloadKeys.length !== payloadKeysPresent) {
    throw new Error(`Response option(s) invalid. Options must include one of the following: ${expectedPayloadKeys.join(', ')}`);
  }
}

function verifyFile(filePath, message) {
  fs.lstat(filePath, (err) => {
    if (err) this.app.log(['handler', 'error'], message);
  });
}

function handler(response) {
  response = response || {};

  validateResponse(response);

  return (req, res) => {
    const start = (new Date).getTime();
    let send;

    if (this.app.config.journal) {
      this.app.log(['request', 'journal'], JSON.stringify({
        callCount: req.callCount,
        url: req.url,
        fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
        clientIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        cookies: req.cookies
      }, null, 2));
    }

    // Default latency to 0 when undefined
    response.latency = response.latency || 0;

    // Default response status to 200 when undefined
    res.status(response.status || 200);

    // set response headers, if received
    if (response.headers) res.set(response.headers);

    if (response.filePath) { // if filePath, send file
      const filePath = expandPath(response.filePath);
      if (response.type) res.type(response.type);
      verifyFile.call(this, filePath, '`filePath` option invalid, file not found at ' + filePath);
      send = res.sendFile.bind(res, filePath);
    } else if (response.fixture) { // if fixture, send fixture file
      const fixturePath = this.app.config.fixturesDir + '/' + response.fixture;
      if (response.type) res.type(response.type);
      verifyFile.call(this, fixturePath, '`fixture` option invalid, fixture not found at ' + fixturePath);
      send = res.sendFile.bind(res, path.normalize(this.app.config.fixturesDir + '/' + response.fixture));
    } else if (response.html) { // if html, set Content-Type to application/html and send
      res.type(response.type || 'html');
      send = res.send.bind(res, response.html);
    } else if (response.json) { // if json, set Content-Type to application/json and send
      res.type(response.type || 'json');
      send = res.send.bind(res, response.json);
    } else if (response.text) { // if text, set Content-Type to text/plain and send
      res.type(response.type || 'text');
      send = res.send.bind(res, response.text);
    } else if (response.raw) { // if raw, don't set Content-Type
      send = res.send.bind(res, response.raw);
    } else { // else send empty response
      res.type(response.type || 'text');
      send = res.send.bind(res);
    }

    setTimeout(() => {
      const duration = (new Date).getTime() - start;
      send();
      this.app.log(['request', req.method], `${req.url} (${duration}ms)`);
    }, response.latency);
  };
}

RouteResolver.prototype.register = function register(route) {
  if (!_.isFunction(route.response)) {
    route.response = handler.call(this, route.response);
  }

  const expectation = new Expectation(route);

  // unregister existing matching routes
  this.unregister([route]);

  this.app[route.method](route.path, expectation.middleware.bind(expectation), route.response);

  return {
    expect: () => expectation.api()
  };
};

RouteResolver.prototype.unregister = function unregister(routes) {
  this.app._router.stack = this.app._router.stack.filter((layer) => {
    return !(layer.route && routes.some((route) => {
      return route.path === layer.route.path && layer.route.methods[route.method] === true;
    }));
  });
};

module.exports = RouteResolver;
