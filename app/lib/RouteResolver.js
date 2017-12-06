'use strict';

const fs = require('fs');
const path = require('path');
const parse = require('url').parse;
const _ = require('lodash');
const pathToRegExp = require('path-to-regexp');
const expandPath = require('../../lib/expandPath');
const Expectation = require('./Expectation');

function isEqualMethod(method1, method2) {
  const m1 = method1.toLowerCase();
  const m2 = method2.toLowerCase();
  return m1 === 'all' || m2 === 'all' || m1 === m2;
}

function isRouteForRequest(route, req) {
  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = parse(req.url, true).pathname;

  if (route.pathname !== '*' && !route.pathRegExp.test(pathname)) return false;

  // TODO: Later add features to match other things, like query parameters, etc.

  return true;
}

function isRouteToReplace(newRoute, oldRoute) {
  return newRoute.pathname === oldRoute.pathname && newRoute.method === oldRoute.method;
}

/**
 * RouteResolver
 *  Facilitates route registration and unregistration.
 *  Implements Express route middleware based on mockyeah API options.
 */
function RouteResolver(app) {
  this.app = app;

  this.routes = [];

  this.listening = false;
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

  route.pathname = parse(route.path, true).pathname;
  route.pathRegExp = pathToRegExp(route.pathname);

  const expectation = new Expectation(route);
  route.expectation = expectation;

  // unregister existing matching routes
  this.unregister([route]);

  this.routes.push(route);

  this.listen();

  return {
    expect: () => expectation.api()
  };
};

RouteResolver.prototype.unregister = function unregister(routes) {
  // Filter out any old routes that match any of the new routes being unregistered.
  this.routes = this.routes.filter(oldRoute =>
    !routes.some(newRoute => isRouteToReplace(newRoute, oldRoute))
  );
};

RouteResolver.prototype.listen = function listen() {
  if (this.listening) return;

  this.listening = true;

  this.app.all('*', (req, res, next) => {
    const route = this.routes.find(r => isRouteForRequest(r, req));

    if (!route) {
      next();
      return;
    }

    const expectationNext = err => {
      if (err) {
        this.app.log(['record', 'expectation', 'error'], err);
        res.sendStatus(500);
        return;
      }
      route.response(req, res);
    };

    route.expectation.middleware(req, res, expectationNext);
  });
};

module.exports = RouteResolver;
