const proxy = require('http-proxy-middleware');
const isAbsoluteUrl = require('is-absolute-url');

module.exports = (req, res, next) => {
  if (!req.app.proxying) {
    next();
    return;
  }

  const reqUrl = req.originalUrl.replace(/^\//, '');

  if (!isAbsoluteUrl(reqUrl)) {
    next();
    return;
  }

  const middleware = proxy({
    target: reqUrl,
    changeOrigin: true,
    logLevel: 'silent', // TODO: Sync with mockyeah settings.
    ignorePath: true
  });

  middleware(req, res, next);
};
