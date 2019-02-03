const request = require('request');
const isAbsoluteUrl = require('is-absolute-url');
const { isEmpty } = require('lodash');
const { decodeProtocolAndPort } = require('./helpers');
const proxyRecord = require('./proxyRecord');

const openingSlashRegex = /^\//;
const leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;

const makeRequestUrl = req =>
  decodeProtocolAndPort(
    req.originalUrl
      .replace(openingSlashRegex, '')
      .replace(leadUrlEncodedProtocolRegex, (match, p1) => `${p1}://`)
  );

const makeRequestOptions = req => {
  const { headers: _headers, method: _method } = req;

  const headers = Object.assign({}, _headers);
  const method = _method.toLowerCase();

  // Recording `host` header is bad for proxy behavior.
  delete headers.host;

  // TODO: Should we support an option to rewrite `origin` header?

  const reqUrl = makeRequestUrl(req);

  const options = {
    method,
    url: reqUrl,
    // TODO: Should we even record headers? Optional?
    headers
  };

  if (!isEmpty(req.body)) {
    options.body = req.body;
    options.json = typeof req.body === 'object';
  }

  return options;
};

const proxyRoute = (req, res, next) => {
  const { app } = req;

  if (!app.locals.proxying) {
    next();
    return;
  }

  const reqUrl = makeRequestUrl(req);

  if (!isAbsoluteUrl(reqUrl)) {
    next();
    return;
  }

  const startTime = new Date().getTime();

  app.log(['proxy', req.method], reqUrl);

  request(makeRequestOptions(req), (err, _res, _body) => {
    if (err) {
      if (err) app.log(['proxy', 'error'], err.message);
      return;
    }

    if (!app.locals.recording) return;

    proxyRecord({
      app,
      req,
      res,
      reqUrl,
      startTime,
      body: _body
    });
  })
    .on('response', _res => {
      if (app.config.responseHeaders) {
        _res.headers['x-mockyeah-proxied'] = 'true';
      }
    })
    .pipe(res);
};

// Export for testing purposes.
proxyRoute.makeRequestUrl = makeRequestUrl;

module.exports = proxyRoute;
