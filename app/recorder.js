const Minimatch = require('minimatch').Minimatch;

module.exports = app => (name, options = {}) => {
  let onlyPattern;

  app.locals.recording = true;
  if (!name) throw new Error('Must provide a recording name.');

  app.log(['serve', 'record'], name);

  if (options.only) {
    // if match is a string, assume it is a url pattern
    onlyPattern = new Minimatch(options.only);
    app.log(['serve', 'record', 'only'], onlyPattern);
  }

  app.locals.recordMeta = {
    name,
    options,
    onlyPattern
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
