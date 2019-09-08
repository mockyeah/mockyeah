const { requireSuite } = require('./helpers');

// Check for an unmounted route dynamically based on header.
const getDynamicSuites = (app, req) => {
  const { suiteHeader, suiteCookie } = app.config;

  let dynamicSuites = req.headers[suiteHeader] || req.cookies[suiteCookie];

  if (!dynamicSuites) return;

  dynamicSuites = dynamicSuites.split(',').map(v => v.trim(v));

  // eslint-disable-next-line consistent-return
  return dynamicSuites
    .map(dynamicSuite => {
      // eslint-disable-next-line array-callback-return
      if (!dynamicSuite) return;

      // eslint-disable-next-line consistent-return
      return requireSuite(app, dynamicSuite);
    })
    .filter(Boolean);
};

module.exports = getDynamicSuites;
