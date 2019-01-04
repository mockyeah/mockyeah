module.exports = app => (name, options = {}) => {
  let only;
  let recordToFixtures;

  if (typeof options.recordToFixtures !== 'undefined') {
    // eslint-disable-next-line prefer-destructuring
    recordToFixtures = options.recordToFixtures;
  } else {
    // eslint-disable-next-line prefer-destructuring
    recordToFixtures = app.config.recordToFixtures;
  }

  app.locals.recording = true;

  if (!name) throw new Error('Must provide a recording name.');

  app.log(['serve', 'record'], name);

  if (options.only) {
    // if only is truthy, assume it is a regex pattern
    const regex = new RegExp(options.only);
    only = regex.test.bind(regex);
    app.log(['serve', 'record', 'only'], regex);
  }

  app.locals.recordMeta = {
    headers: options.headers,
    name,
    options,
    only,
    set: [],
    recordToFixtures
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
