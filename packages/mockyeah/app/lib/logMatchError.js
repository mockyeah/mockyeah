const logMatchError = (app, { match, route }) => {
  const { suiteName, suiteIndex } = route;
  const suiteLabel = suiteName && `${suiteName}[${suiteIndex || 0}]`;
  const safeSuiteLabel = suiteLabel ? `${suiteLabel} ` : '';
  if (match.errors) {
    match.errors.forEach(error => {
      const keyPath = error.keyPath.join('.');
      app.log(['match', 'error'], `${safeSuiteLabel}"${keyPath}": ${error.message}`, true);
    });
  }
};

module.exports = logMatchError;
