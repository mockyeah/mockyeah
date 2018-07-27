module.exports = app => (name, options) => {
  app.locals.recording = true;
  if (!name) throw new Error('Must provide a recording name.');

  app.log(['serve', 'record'], name);

  app.locals.recordMeta = {
    name,
    options
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
