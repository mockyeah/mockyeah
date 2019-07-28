const { isEmpty } = require('lodash');
const isAbsoluteUrl = require('is-absolute-url');
const matches = require('match-deep');
const normalize = require('mockyeah-fetch/dist/normalize');

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

const routeMatchesRequestAliases = (normalizedRoute, normalizedReq, url, options) => {
  const { aliases } = options;

  const aliasReplacements = findAliasReplacements(url, aliases);

  if (aliasReplacements) {
    let aliasMatch;

    Object.keys(aliasReplacements).find(toReplace => {
      const aliasReplacementsForToReplace = aliasReplacements[toReplace];

      return aliasReplacementsForToReplace.find(alias => {
        if (toReplace === alias) return undefined;

        const aliasedPathname = normalizedReq.pathname.replace(toReplace, alias);

        const aliasedReq = Object.assign({}, normalizedReq, {
          pathname: aliasedPathname
        });

        aliasMatch = matches(aliasedReq, normalizedRoute);

        return aliasMatch.result;
      });
    });

    return aliasMatch;
  }

  return undefined;
};

// TODO: Refactor to return match object, not just result boolean.
const routeMatchesRequest = (route, req, options = {}) => {
  // TODO: Later add features to match other things, like cookies, or with other types, etc.

  const normalizedRoute = normalize(route[0]);

  // const pathname = decodeProtocolAndPort(parse(req.url, true).pathname);

  const urlNoSlashPrefix = req.url.replace(/^\//, '');

  const normalizedReq = normalize(
    {
      method: req.method,
      url: isAbsoluteUrl(urlNoSlashPrefix) ? urlNoSlashPrefix : req.url,
      query: req.query,
      body: req.body,
      headers: req.headers
    },
    true
  );

  const match = matches(normalizedReq, normalizedRoute);

  if (options.log) options.log({ match, route });

  if (match.result) return true;

  const url = normalizedReq.url.toString().replace(/^\//, '');

  const reqPathnameIsAbsoluteUrl = isAbsoluteUrl(url);

  if (reqPathnameIsAbsoluteUrl) {
    const aliasMatch = routeMatchesRequestAliases(normalizedRoute, normalizedReq, url, options);

    if (aliasMatch && aliasMatch.result) {
      return true;
    }
  }

  return false;
};

module.exports = routeMatchesRequest;
