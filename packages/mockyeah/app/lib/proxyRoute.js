const { isPlainObject, flatten } = require('lodash');
const { decodeProtocolAndPort } = require('./helpers');
const proxyRecord = require('./proxyRecord');
const getDynamicSuites = require('./getDynamicSuites');

const openingSlashRegex = /^\//;
const leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;

const makeRequestUrl = req => {
  const isAbsolute = /^\/+https?[:~][/~]{2}/.test(decodeURIComponent(req.originalUrl));

  return isAbsolute
    ? decodeProtocolAndPort(
        req.originalUrl
          .replace(openingSlashRegex, '')
          .replace(leadUrlEncodedProtocolRegex, (match, p1) => `${p1}://`)
      )
    : req.originalUrl;
};

const makeRequestOptions = req => {
  const { headers: _headers, method: _method, rawBody } = req;

  const headers = Object.assign({}, _headers);
  const method = _method.toLowerCase();

  // Recording `host` header is bad for proxy behavior.
  delete headers.host;

  // TODO: Should we support an option to rewrite `origin` header?

  const reqUrl = makeRequestUrl(req);

  return {
    method,
    url: reqUrl,
    // TODO: Should we even record headers? Optional?
    headers,
    body: rawBody
  };
};

const proxyRoute = (req, res, next) => {
  const { app } = req;

  if (app.config.journal) {
    app.log(
      ['request', 'journal'],
      JSON.stringify(
        {
          callCount: req.callCount,
          url: req.url,
          fullUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
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

  const reqUrl = makeRequestUrl(req);

  const startTime = new Date().getTime();

  const requestOptions = makeRequestOptions(req);

  const fetchOptions = {
    method: (requestOptions.method || 'GET').toUpperCase(),
    headers: requestOptions.headers,
    body: requestOptions.body
  };

  const dynamicMocks = flatten(getDynamicSuites(app, req));

  app.locals.mockyeahFetch
    .fetch(reqUrl, fetchOptions, {
      proxy: app.locals.proxying,
      dynamicMocks
    })
    .then(({ response: fetchRes, mock }) =>
      fetchRes.text().then(body => ({ fetchRes, mock, body }))
    )
    .then(({ fetchRes, mock, body }) => {
      if (mock) {
        const [match] = mock;
        if (match.$meta && match.$meta.expectation) {
          match.$meta.expectation.middleware(req, res);
        }
      } else {
        app.log(['proxy', req.method], reqUrl);

        if (app.config.responseHeaders) {
          res.set('x-mockyeah-proxied', 'true');
        }
      }

      // TODO: Handle all forms of headers including object, tuple array, Headers instance, etc.
      let headers = {};

      if (fetchRes.headers) {
        if (typeof fetchRes.headers.forEach === 'function') {
          fetchRes.headers.forEach((v, k) => {
            if (k === 'content-encoding') return;
            headers[k] = v;
            res.set(k, v);
          });
        } else if (isPlainObject(fetchRes.headers)) {
          headers = Object.entries(fetchRes.headers).forEach(([k, v]) => {
            if (k === 'content-encoding') return;
            headers[k] = v;
            res.set(k, v);
          });
        }
      }

      const { status } = fetchRes;

      if (app.locals.recording) {
        proxyRecord({
          app,
          req,
          reqUrl,
          startTime,
          body,
          headers,
          status
        });
      }

      res.status(status);

      // TODO: Support streaming response back, even when also buffering for recording.

      if (!body) {
        res.end();
      } else {
        res.send(body);
      }
    })
    .catch(err => {
      app.log(['proxy', 'error'], err.message);
      next(err);
    });
};

// Export for testing purposes.
proxyRoute.makeRequestUrl = makeRequestUrl;

module.exports = proxyRoute;
