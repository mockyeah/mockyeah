const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const relativeRoot = require('../lib/relativeRoot');
const {
  resolveFilePath,
  getDataForRecordToFixtures,
  replaceFixtureWithRequireInJson
} = require('./lib/helpers');

module.exports = app => cb => {
  app.locals.recording = false;

  if (!app.locals.recordMeta) {
    return;
  }

  const { recordToFixtures, recordToFixturesMode, formatScript } = app.config;

  const {
    recordMeta: { name, set }
  } = app.locals;

  if (!name) throw new Error('Not recording.');

  const { suitesDir, fixturesDir } = app.config;

  const suitePath = path.join(suitesDir, name);

  mkdirp.sync(suitePath);

  const suiteFilePath = resolveFilePath(suitePath, 'index.js');

  const newSet = set.map((suite, index) => {
    const [match, responseOptions] = suite;

    app.log(['serve', 'suite'], match.url || match.path || match);

    if (recordToFixtures) {
      const { newResponseOptions, body } = getDataForRecordToFixtures({
        responseOptions,
        name,
        index
      });

      const { fixture } = newResponseOptions;

      if (fixture) {
        const fixturesPath = path.join(fixturesDir, fixture);

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        mkdirp.sync(path.join(fixturesDir, name));

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        fs.writeFileSync(fixturesPath, body);
      }

      return [match, newResponseOptions];
    }

    return [match, responseOptions];
  });

  let js = JSON.stringify(newSet, null, 2);

  if (recordToFixturesMode === 'require') {
    js = replaceFixtureWithRequireInJson(js, {
      relativePath: path.relative(suitePath, fixturesDir)
    });
  }

  let jsModule = `module.exports = ${js};`;

  if (formatScript) {
    let formatFunction;

    if (typeof formatScript === 'string') {
      const formatScriptModulePath = path.resolve(relativeRoot, formatScript);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      formatFunction = require(formatScriptModulePath);
    } else {
      formatFunction = formatScript;
    }

    if (formatFunction) {
      jsModule = formatFunction(jsModule);
    }
  }

  fs.writeFile(suiteFilePath, jsModule, err => {
    if (err) {
      app.log(['record', 'response', 'error'], err);

      cb(err);

      return;
    }

    set.forEach(suite => {
      app.log(['record', 'response', 'saved'], suite[0].path || suite[0].url || suite[0]);
    });

    if (typeof app.locals.proxyingBeforeRecording !== 'undefined') {
      app.locals.proxying = app.locals.proxyingBeforeRecording;
      delete app.locals.proxyingBeforeRecording;
    }

    delete app.locals.recordMeta;

    if (cb) cb();
  });
};
