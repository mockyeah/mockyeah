const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { resolveFilePath } = require('./lib/helpers');

module.exports = app => cb => {
  app.locals.recording = false;

  if (!app.locals.recordMeta) {
    return;
  }

  const {
    recordMeta: { name, set }
  } = app.locals;

  if (!name) throw new Error('Not recording.');

  const { capturesDir } = app.config;
  const capturePath = path.join(capturesDir, name);

  mkdirp.sync(capturePath);

  const filePath = resolveFilePath(capturePath, 'index.js');

  set.forEach(capture => {
    app.log(['serve', 'capture'], capture[0].url);
  });

  const json = JSON.stringify(set, null, 2);
  const js = `module.exports = ${json};`;

  fs.writeFile(filePath, js, err => {
    if (err) {
      app.log(['record', 'response', 'error'], err);

      cb(err);

      return;
    }

    set.forEach(capture => {
      app.log(['record', 'response', 'saved'], capture[0].url);
    });

    if (typeof app.locals.proxyingBeforeRecording !== 'undefined') {
      app.locals.proxying = app.locals.proxyingBeforeRecording;
      delete app.locals.proxyingBeforeRecording;
    }

    delete app.locals.recordMeta;

    if (cb) cb();
  });
};
