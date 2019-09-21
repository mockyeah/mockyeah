const fs = require('fs');
const safeFilename = require('../../lib/safeFilename');
const expandPath = require('../../lib/expandPath');

const readFile = filePath =>
  new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

const makeFileResolver = app => filePath => {
  const relativeFilePath = expandPath(safeFilename(filePath), app.config.root);
  return readFile(relativeFilePath);
};

const makeFixtureResolver = app => fixture => {
  const fixturePath = `${app.config.fixturesDir}/${safeFilename(fixture)}`;
  return readFile(fixturePath);
};

exports.makeFileResolver = makeFileResolver;
exports.makeFixtureResolver = makeFixtureResolver;
