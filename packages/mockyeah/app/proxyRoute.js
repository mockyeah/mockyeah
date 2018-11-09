const request = require('request');
const isAbsoluteUrl = require('is-absolute-url');
const { isEmpty } = require('lodash');

const now = () => new Date().getTime();

const openingSlashRegex = /^\//;
const leadProtocolRegex = /^(https?)%3A%2F%2F/;

const makeRequestUrl = req =>
  req.originalUrl
    .replace(openingSlashRegex, '')
    .replace(leadProtocolRegex, (match, p1) => `${p1}://`);

const makeRequestOptions = req => {
  const { headers: _headers, method: _method } = req;

  const headers = Object.assign({}, _headers);
  const method = _method.toLowerCase();

  // Recording `host` header is bad for proxy behavior.
  delete headers.host;

  // TODO: Should we support an option to rewrite `origin` header?

  // Don't record the `transfer-encoding` header since `chunked` value can cause `ParseError`s with `request`.
  delete headers['transfer-encoding'];

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
  const { recordMeta } = app.locals;

  if (!app.locals.proxying) {
    next();
    return;
  }

  const reqUrl = makeRequestUrl(req);

  if (!isAbsoluteUrl(reqUrl)) {
    next();
    return;
  }

  const startTime = now();

  app.log(['proxy', req.method], reqUrl);

  request(makeRequestOptions(req), (err, _res, _body) => {
    if (err) {
      if (err) app.log(['proxy', 'error'], err.message);
      return;
    }

    if (!app.locals.recording) return;

    const { only } = recordMeta;

    if (only && !only(reqUrl)) return;

    const { method, body: reqBody } = req;

    const { statusCode: status, _headers: headers } = res;

    const latency = now() - startTime;

    app.locals.recordMeta.set.push([
      {
        method: method.toLowerCase(),
        url: reqUrl,
        body: reqBody,
        headers: recordMeta.headers
      },
      {
        headers,
        status,
        raw: _body, // TODO: Support JSON response deserialized
        latency
      }
    ]);
  }).pipe(res);
};

// Export for testing purposes.
proxyRoute.makeRequestUrl = makeRequestUrl;

module.exports = proxyRoute;
