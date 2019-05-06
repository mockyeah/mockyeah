const { flatten } = require('lodash');
const { requireSuite } = require('../lib/helpers');

const flattenNames = names =>
  Array.isArray(names)
    ? flatten(names.map(name => flattenNames(name)))
    : names.split(',').map(v => v.trim());

const makePlay = app => {
  const play = names => {
    if (!names) return;

    names = flattenNames(names);

    if (!names.length) return;

    names.forEach(name => {
      const suite = requireSuite(app, name);

      if (!suite) return;

      app.locals.playingSuites.push(name);

      app.log(['serve', 'play'], name);

      suite.map((c, i) =>
        app.routeManager.all(...c, {
          suiteName: name,
          suiteIndex: i
        })
      );
    });
  };

  return play;
};

module.exports = makePlay;
