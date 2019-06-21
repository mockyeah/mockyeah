const checkVersionMatch = require('../checkVersionMatch');

describe('checkVerisonMatch', () => {
  describe('checkVersionMatchWithPackage', () => {
    test('throws on missing CLI package version', () => {
      expect(() => {
        const env = {};
        const pkgUp = {};
        checkVersionMatch(env, pkgUp);
      }).toThrow('Could not find `mockyeah-cli` package version to check against core.');
    });

    test('throws on missing env package version', () => {
      expect(() => {
        const env = {};
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow('Could not find `mockyeah` package version to check against CLI.');
    });

    test('throws on mismatch package versions', () => {
      expect(() => {
        const env = {
          modulePackage: {
            version: '99.99.99-test'
          }
        };
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow(
        'Version mismatch between CLI (0.0.0-test) and core (99.99.99-test) - please install same versions.'
      );
    });

    test('passes on matching package versions', () => {
      expect(() => {
        const env = {
          modulePackage: {
            version: '0.0.0-test'
          }
        };
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).not.toThrow();
    });
  });
});
