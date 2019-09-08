const fs = require('fs');
const _ = require('lodash');
const safeFilename = require('../../lib/safeFilename');
const expandPath = require('../../lib/expandPath');
const relativeRoot = require('../../lib/relativeRoot');

const handleFileResponse = (filePath, resOpts) => {
  resOpts.raw = () =>
    new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  const relativeFilePath = filePath.replace(relativeRoot, '').replace(/^\//, '');
  resOpts.type = resOpts.type || relativeFilePath;
};

const modifyMockForMockyeahFetch = (app, match, _resOpts, method) => {
  let newResOpts = _resOpts;

  // eslint-disable-next-line no-underscore-dangle
  const matchWithMethod = _.isPlainObject(match) ? Object.assign({}, match) : { url: match };
  matchWithMethod.method = matchWithMethod.method || method;

  if (_.isPlainObject(_resOpts)) {
    newResOpts = Object.assign({}, _resOpts);

    if (newResOpts.fixture) {
      const fixture = safeFilename(newResOpts.fixture);
      const fixturePath = `${app.config.fixturesDir}/${fixture}`;
      handleFileResponse(fixturePath, newResOpts);
      delete newResOpts.fixture;
    } else if (newResOpts.filePath) {
      const filePath = expandPath(newResOpts.filePath, app.config.root);
      handleFileResponse(filePath, newResOpts);
      delete newResOpts.filePath;
    }
  }

  return [matchWithMethod, newResOpts];
};

module.exports.modifyMockForMockyeahFetch = modifyMockForMockyeahFetch;
