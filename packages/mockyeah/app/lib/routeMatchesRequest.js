const { isEmpty } = require('lodash');
const { parse } = require('url');
const isAbsoluteUrl = require('is-absolute-url');
const { decodeProtocolAndPort, normalizePathname } = require('./helpers');
const matches = require('./matches');

function isEqualMethod(method1, method2) {
  const m1 = method1.toLowerCase();
  const m2 = method2.toLowerCase();
  return m1 === 'all' || m2 === 'all' || m1 === m2;
}

// eslint-disable-next-line consistent-return
const findAliasReplacements = (url, aliases = []) => {
  const aliasReplacements = {};

  aliases.forEach(aliasSet => {
    aliasSet.forEach(alias => {
      if (url.startsWith(alias)) {
        aliasReplacements[alias] = aliasSet;
      }
    });
  });

  if (!isEmpty(aliasReplacements)) return aliasReplacements;
};

const routeMatchesRequest = (route, req, options) => {
  const { aliases } = options;

  if (!isEqualMethod(req.method, route.method)) return false;

  const pathname = normalizePathname(parse(req.url, true).pathname);

  const decodedPathname = decodeProtocolAndPort(pathname);

  const url = decodedPathname.toString().replace(/^\//, '');

  const reqPathnameIsAbsoluteUrl = isAbsoluteUrl(url);

  if (reqPathnameIsAbsoluteUrl) {
    const aliasReplacements = findAliasReplacements(url, aliases);

    if (aliasReplacements) {
      const matchesAnyAliases = Object.keys(aliasReplacements).some(toReplace => {
        const aliasReplacementsForToReplace = aliasReplacements[toReplace];
        return aliasReplacementsForToReplace.some(alias => {
          const aliasedPathname = decodedPathname.replace(toReplace, alias);
          const matchesAlias = route.pathFn(aliasedPathname);
          return matchesAlias;
        });
      });

      // eslint-disable-next-line no-lonely-if
      if (!matchesAnyAliases) return false;
    } else if (!route.pathFn(pathname)) return false;
  } else {
    // eslint-disable-next-line no-lonely-if
    if (route.pathname !== '*' && !route.pathFn(pathname)) return false;
  }

  if (route.query && !matches(req.query, route.query).result) return false;

  if (route.body && !matches(req.body, route.body).result) return false;

  if (route.headers && !matches(req.headers, route.headers).result) return false;

  // TODO: Later add features to match other things, like cookies, or with other types, etc.

  return true;
};

module.exports = routeMatchesRequest;
