const { compileRoute, requireSuite } = require('./helpers');
const routeMatchesRequest = require('./routeMatchesRequest');

// Check for an unmounted route dynamically based on header.
const handleDynamicSuite = (app, req, res) => {
  const dynamicSuite = req.headers['x-mockyeah-suite'];

  if (!dynamicSuite) return false;

  const suite = requireSuite(app, dynamicSuite);

  if (!suite) return false;

  const {
    config: { aliases }
  } = app;

  let compiledRoute;

  const route = suite.find(r => {
    compiledRoute = compileRoute(app, r[0], r[1]);

    return routeMatchesRequest(compiledRoute, req, {
      aliases
    });
  });

  if (!route) return false;

  compiledRoute.response(app, req, res);

  return true;
};

module.exports = handleDynamicSuite;
