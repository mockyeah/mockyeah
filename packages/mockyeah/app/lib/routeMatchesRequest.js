const { isEmpty, isPlainObject } = require('lodash');
const { parse } = require('url');
const isAbsoluteUrl = require('is-absolute-url');
const { decodeProtocolAndPort, normalizePathname } = require('./helpers');
const matches = require('./matches');

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
const routeMatchesRequest = (route, req, options) => {
  // TODO: Later add features to match other things, like cookies, or with other types, etc.

  const normalizedRoute = {
    method: route.method && route.method.toLowerCase(),
    pathname: route.pathFn,
    query: isEmpty(route.query) ? undefined : route.query,
    body: route.body,
    headers: isEmpty(route.headers) ? undefined : route.headers
  };

  const pathname = decodeProtocolAndPort(normalizePathname(parse(req.url, true).pathname));

  const normalizedReq = {
    method: req.method && req.method.toLowerCase(),
    pathname,
    query: isEmpty(route.query) ? undefined : req.query,
    body: route.body && (!isPlainObject(route.body) || !isEmpty(route.body)) ? req.body : undefined,
    headers: isEmpty(route.headers) ? undefined : req.headers
  };

  if (route.path === '*') {
    delete normalizedRoute.pathname;
  }

  if ((normalizedRoute.method || '').toLowerCase() === 'all') {
    delete normalizedRoute.method;
  }

  const match = matches(normalizedReq, normalizedRoute);

  if (match.result) return true;

  const url = normalizedReq.pathname.toString().replace(/^\//, '');

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
