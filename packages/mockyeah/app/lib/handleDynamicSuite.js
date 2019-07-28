const { requireSuite } = require('./helpers');
const logMatchError = require('./logMatchError');
const routeMatchesRequest = require('./routeMatchesRequest');

// Check for an unmounted route dynamically based on header.
const handleDynamicSuite = (app, req, res) => {
  const { suiteHeader, suiteCookie } = app.config;

  let dynamicSuites = req.headers[suiteHeader] || req.cookies[suiteCookie];

  if (!dynamicSuites) return false;

  dynamicSuites = dynamicSuites.split(',').map(v => v.trim(v));

  return dynamicSuites.some(dynamicSuite => {
    if (!dynamicSuite) return false;

    const suite = requireSuite(app, dynamicSuite);

    if (!suite) return false;

    const {
      config: { aliases }
    } = app;

    let compiledRoute;

    const route = suite.find(r =>
      routeMatchesRequest(r, req, {
        aliases,
        log: logMatchError.bind(null, app)
      })
    );

    if (!route) return false;

    compiledRoute.response(app, req, res);

    return true;
  });
};

module.exports = handleDynamicSuite;
