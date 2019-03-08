const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const relativeRoot = require('../../lib/relativeRoot');
const {
  resolveFilePath,
  getDataForRecordToFixtures,
  replaceFixtureWithRequireInJson
} = require('../lib/helpers');
const safeFilename = require('../../lib/safeFilename');

const makeRecordStop = app => {
  const recordStop = cb => {
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

    const suiteFileame = safeFilename(name);

    const suitePath = path.join(suitesDir, suiteFileame);

    mkdirp.sync(suitePath);

    const suiteFilePath = resolveFilePath(suitePath, 'index.js');

    let i = 0;
    const indexByDirectory = {};

    const newSet = set.map(suite => {
      const [match, responseOptions, options = {}] = suite;

      const { group } = options;

      const { directory } = group || {};

      let index;
      if (directory) {
        index = indexByDirectory[directory] || 0;
        indexByDirectory[directory] = indexByDirectory[directory]
          ? indexByDirectory[directory] + 1
          : 1;
      } else {
        index = i;
        i += 1;
      }

      app.log(['serve', 'suite'], match.url || match.path || match);

      if (recordToFixtures) {
        const { newResponseOptions, body } = getDataForRecordToFixtures({
          responseOptions,
          name,
          index,
          group
        });

        const { fixture } = newResponseOptions;

        if (fixture) {
          const fixturesPath = path.join(fixturesDir, fixture);

          // TODO: Any easy way to coordinate this asynchronously?
          // eslint-disable-next-line no-sync
          mkdirp.sync(path.resolve(fixturesPath, '..'));

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

  return recordStop;
};

module.exports = makeRecordStop;
