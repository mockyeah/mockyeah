const UrlPattern = require('url-pattern');

module.exports = app => (name, options = {}) => {
  const { match } = options;
  let matchFn = () => true;

  app.locals.recording = true;
  if (!name) throw new Error('Must provide a recording name.');

  app.log(['serve', 'record'], name);

  if (match) {
    const urlPattern = new UrlPattern(match);
    app.log(['serve', 'record', 'match'], urlPattern.stringify());
    matchFn = urlPattern.match.bind(urlPattern);
  }

  app.locals.recordMeta = {
    name,
    options,
    match: matchFn
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
