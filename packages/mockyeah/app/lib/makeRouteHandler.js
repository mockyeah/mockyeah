'use strict';

const fs = require('fs');
const path = require('path');
const expandPath = require('../../lib/expandPath');
const safeFilename = require('../../lib/safeFilename');

/**
 *
 * @param {*} res
 * @param {*} next
 * @param {*} promise
 * @returns {bool} Whether or not the argument was a promise and was handled.
 */
const handlePromise = (res, next, promise) => {
  if (!(promise instanceof Promise)) return false;

  promise
    .then(result => {
      res.send(result);
    })
    .catch(err => next(err));

  return true;
};

/**
 *
 * @param {*} res
 * @param {*} next
 * @param {*} promise
 * @returns {bool} Whether or not the argument was a function and was handled.
 */
const handleFunction = (req, res, next, data) => {
  if (typeof data !== 'function') return false;

  try {
    const result = data(req);
    if (handlePromise(res, next, result)) return true;
    res.send(result);
  } catch (err) {
    next(err);
  }

  return true;
};

/**
 * Handle data as potentially function or promise.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} data Either raw data supported but `res.send`,
 *  or a promise resolving such data, or a function returning such data or such a promise.
 */
const handleData = (req, res, next, data) => {
  if (handleFunction(req, res, next, data)) return;
  if (handlePromise(res, next, data)) return;

  // Else it's raw data, so send it directly.
  res.send(data);
};

/* eslint-disable prefer-template */
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
    expectedPayloadKeys.forEach(expectedKey => {
      if (key === expectedKey) ++payloadKeysPresent; // eslint-disable-line no-plusplus
    });
  });

  if (payloadKeysPresent.length > 1) {
    throw new Error(
      `Response options must not include more than one of the following: ${expectedPayloadKeys.join(
        ', '
      )}`
    );
  }

  if (payloadKeys.length !== payloadKeysPresent) {
    throw new Error(
      `Response option(s) invalid. Options must include one of the following: ${expectedPayloadKeys.join(
        ', '
      )}`
    );
  }
}

function verifyFile(app, filePath, message) {
  fs.lstat(filePath, err => {
    if (err) app.log(['handler', 'error'], message);
  });
}

const makeRouteHandler = route => {
  const response = route.response || {};

  if (response.filePath) {
    response.filePath = safeFilename(response.filePath);
  }

  validateResponse(response);

  function routeHandler(app, req, res, next) {
    const start = new Date().getTime();
    let send;

    if (app.config.journal) {
      app.log(
        ['request', 'journal'],
        JSON.stringify(
          {
            callCount: req.callCount,
            url: req.url,
            fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            clientIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            method: req.method,
            headers: req.headers,
            query: req.query,
            body: req.body,
            cookies: req.cookies
          },
          null,
          2
        )
      );
    }

    // Default latency to 0 when undefined
    response.latency = response.latency || 0;

    // Default response status to 200 when undefined
    res.status(response.status || 200);

    // set response headers, if received
    if (response.headers) res.set(response.headers);

    if (app.config.responseHeaders) {
      res.set('x-mockyeah-mocked', 'true');
    }

    const handleDataBound = handleData.bind(null, req, res, next);

    if (response.filePath) {
      // if filePath, send file
      const filePath = expandPath(response.filePath, app.config.root);
      if (response.type) res.type(response.type);
      verifyFile(app, filePath, '`filePath` option invalid, file not found at ' + filePath);
      send = res.sendFile.bind(res, filePath);
    } else if (response.fixture) {
      // if fixture, send fixture file
      const fixturePath = app.config.fixturesDir + '/' + response.fixture;
      if (response.type) res.type(response.type);
      verifyFile(app, fixturePath, '`fixture` option invalid, fixture not found at ' + fixturePath);
      send = res.sendFile.bind(
        res,
        path.normalize(app.config.fixturesDir + '/' + response.fixture)
      );
    } else if (response.html) {
      // if html, set Content-Type to application/html and send
      res.type(response.type || 'html');
      send = handleDataBound.bind(null, response.html);
    } else if (response.json) {
      // if json, set Content-Type to application/json and send
      res.type(response.type || 'json');
      send = handleDataBound.bind(null, response.json);
    } else if (response.text) {
      // if text, set Content-Type to text/plain and send
      res.type(response.type || 'text');
      send = handleDataBound.bind(null, response.text);
    } else if (response.raw) {
      // if raw, don't set Content-Type
      send = handleDataBound.bind(null, response.raw);
    } else {
      // else send empty response
      res.type(response.type || 'text');
      send = res.send.bind(res);
    }

    setTimeout(() => {
      const duration = new Date().getTime() - start;
      send();
      app.log(['request', req.method], `${req.url} (${duration}ms)`);
    }, response.latency);
  }

  return routeHandler;
};

module.exports = makeRouteHandler;
