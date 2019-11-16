const checkVersionMatch = require('../checkVersionMatch');

describe('checkVerisonMatch', () => {
  describe('checkVersionMatchWithPackage', () => {
    test('throws on missing CLI package version', () => {
      expect(() => {
        const env = {};
        const pkgUp = {};
        checkVersionMatch(env, pkgUp);
      }).toThrow('Could not find `@mockyeah/cli` package version to check against core.');
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
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        const env = {
          modulePackage: {
            version: '99.99.99-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow(
        'Version mismatch between @mockyeah/cli@0.0.0-test and @mockyeah/server@99.99.99-test - please install compatible versions.'
      );
    });

    test('passes on identical package versions', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        const env = {
          modulePackage: {
            version: '0.0.0-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).not.toThrow();
    });

    test('passes on identical package versions', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '0.0.0-test'
          }
        };
        const env = {
          modulePackage: {
            version: '0.0.0-test'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).not.toThrow();
    });

    test('passes on different prerelease package versions', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '0.0.1-alpha.1'
          }
        };
        const env = {
          modulePackage: {
            version: '0.0.1-alpha.2'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).not.toThrow();
    });

    test('passes on different patch package versions', () => {
      expect(() => {
        const env = {
          modulePackage: {
            version: '0.0.1'
          }
        };
        const pkgUp = {
          package: {
            version: '0.0.2'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).not.toThrow();
    });

    test('throws on different minor package versions', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '0.1.0'
          }
        };
        const env = {
          modulePackage: {
            version: '0.2.0'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow(
        'Version mismatch between @mockyeah/cli@0.1.0 and @mockyeah/server@0.2.0 - please install compatible versions.'
      );
    });

    test('throws on different major package versions', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '1.0.0'
          }
        };
        const env = {
          modulePackage: {
            version: '2.0.0'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow(
        'Version mismatch between @mockyeah/cli@1.0.0 and @mockyeah/server@2.0.0 - please install compatible versions.'
      );
    });

    test('throws on different major package versions with prerelease', () => {
      expect(() => {
        const pkgUp = {
          package: {
            version: '1.0.0'
          }
        };
        const env = {
          modulePackage: {
            version: '2.0.0-alpha.0'
          }
        };
        checkVersionMatch(env, pkgUp);
      }).toThrow(
        'Version mismatch between @mockyeah/cli@1.0.0 and @mockyeah/server@2.0.0-alpha.0 - please install compatible versions.'
      );
    });
  });
});
