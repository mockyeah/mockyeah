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
    recordMeta: { name, set, recordToFixtures, recordToFixturesMode }
  } = app.locals;

  if (!name) throw new Error('Not recording.');

  const { capturesDir, fixturesDir } = app.config;

  const capturePath = path.join(capturesDir, name);

  mkdirp.sync(capturePath);

  const filePath = resolveFilePath(capturePath, 'index.js');

  set.forEach((capture, index) => {
    const [match, responseOptions] = capture;

    app.log(['serve', 'capture'], match.url || match.path || match);

    if (recordToFixtures) {
      const { raw, json } = responseOptions;

      const fixtureName = `${name}/${index}`;

      let fixture;
      let body;

      if (raw) {
        fixture = `${fixtureName}.txt`;
        body = raw;
        delete responseOptions.raw;
      } else if (json) {
        fixture = `${fixtureName}.json`;
        body = JSON.stringify(json, null, 2);
        delete responseOptions.json;
      }

      if (fixture) {
        responseOptions.fixture = fixture;

        const fixturesPath = path.join(fixturesDir, fixture);

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        mkdirp.sync(path.join(fixturesDir, name));

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        fs.writeFileSync(fixturesPath, body);
      }
    }
  });

  let json = JSON.stringify(set, null, 2);

  if (recordToFixturesMode === 'require') {
    const relativePath = path.relative(capturePath, fixturesDir);
    json = json.replace(
      /"fixture"(\s*):(\s*)"([^"]+)\.json"/g,
      `"json"$1:$2require("${relativePath}/$3.json")`
    );
  }

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
