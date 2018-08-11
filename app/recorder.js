const UrlPattern = require('url-pattern');

module.exports = app => (name, options = {}) => {
  let { match } = options;

  app.locals.recording = true;
  if (!name) throw new Error('Must provide a recording name.');

  app.log(['serve', 'record'], name);

  if (typeof match === 'string') {
    // if match is a string, assume it is a url pattern
    const urlPattern = new UrlPattern(match);
    app.log(['serve', 'record', 'match'], urlPattern.stringify());
    match = urlPattern.match.bind(urlPattern);
  }

  if (!match) {
    // if match is not defined, assign noop which matches all requests
    match = () => true;
  }

  app.locals.recordMeta = {
    name,
    options,
    match
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
