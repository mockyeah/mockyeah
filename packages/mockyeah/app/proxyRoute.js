const request = require('request');
const isAbsoluteUrl = require('is-absolute-url');

const now = () => new Date().getTime();

const makeRequestUrl = req => req.originalUrl.replace(/^\//, '');

const makeRequestOptions = req => {
  const { _headers, method: _method } = req;

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
    headers,
    body: req.body,
    json: typeof req.body === 'object'
  };

  return options;
};

module.exports = (req, res, next) => {
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

  const startTime = now();

  app.log(['proxy', req.method], reqUrl);

  request(makeRequestOptions(req), (err, _res, _body) => {
    if (err) {
      if (err) app.log(['proxy', 'error'], err.message);
      return;
    }

    if (app.locals.recording) {
      const { method, body: reqBody } = req;

      const { statusCode: status, _headers: headers } = res;

      const latency = now() - startTime;

      app.locals.recordMeta = app.locals.recordMeta || {};
      app.locals.recordMeta.set = app.locals.recordMeta.set || [];
      app.locals.recordMeta.set.push([
        {
          method: method.toLowerCase(),
          url: reqUrl,
          body: reqBody
        },
        {
          headers,
          status,
          raw: _body, // TODO: Support JSON response deserialized
          latency
        }
      ]);
    }
  }).pipe(res);
};
