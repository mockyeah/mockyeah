const { compileRoute, requireSuite } = require('./helpers');
const routeMatchesRequest = require('./routeMatchesRequest');

// Check for an unmounted route dynamically based on header.
const handleDynamicSuite = (app, req, res) => {
  const { suiteHeader, suiteCookie } = app.config;

  const dynamicSuite = req.headers[suiteHeader] || req.cookies[suiteCookie];

  if (!dynamicSuite) return false;

  const suite = requireSuite(app, dynamicSuite);

  if (!suite) return false;

  const {
    config: { aliases }
  } = app;

  let compiledRoute;

  const route = suite.find(r => {
    compiledRoute = compileRoute(r[0], r[1]);

    return routeMatchesRequest(compiledRoute, req, {
      aliases
    });
  });

  if (!route) return false;

  compiledRoute.response(app, req, res);

  return true;
};

module.exports = handleDynamicSuite;
