import { parse } from 'url';
import qs from 'qs';
import pathToRegexp from 'path-to-regexp';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import isRegExp from 'lodash/isRegExp';
import mapValues from 'lodash/mapValues';
import { MatchNormal, MatchObject, MatchFunction, MatchString, Match, Method } from './types';

const decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
const decodedProtocolRegex = /^(\/?https?).{3}/;
const encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
const encodedProtocolRegex = /^(\/?https?).{3}/;

// Restore any special protocol or port characters that were possibly tilde-replaced.
const decodeProtocolAndPort = (str: string) =>
  str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');

const encodeProtocolAndPort = (str: string) =>
  str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');

const stripQuery = (url: string) => {
  let parsed;

  // is absolute?
  if (/^https?:/.test(url)) {
    parsed = parse(url);
    url = `${parsed.protocol || 'http:'}//${parsed.hostname}${
      parsed.port && !['80', '443'].includes(parsed.port) ? `:${parsed.port}` : ''
    }${parsed.pathname}`;
  } else {
    parsed = parse(`http://example.com${url.startsWith('/') ? url : `/${url}`}`);
    url = parsed.pathname || '';
  }

  const query = parsed.query ? qs.parse(parsed.query) : undefined;

  return {
    url,
    query
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeObject = (object: any): any =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapValues(object, (value: any) => {
    if (isRegExp(value)) {
      return {
        $regex: {
          source: value.source,
          flags: value.flags
        }
      };
    }
    if (isPlainObject(value)) return mapValues(value, v => serializeObject(v));
    return value;
  });

const leadingSlashRegex = /^\//;
const leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;

const stripLeadingSlash = (url: string) => url.replace(leadingSlashRegex, '');

const makeRequestUrl = (url: string) => {
  const isAbsolute = /^\/+https?[:~][/~]{2}/.test(url);

  return isAbsolute
    ? decodeProtocolAndPort(
        stripLeadingSlash(url).replace(
          leadUrlEncodedProtocolRegex,
          (match: string, p1: string) => `${p1}://`
        )
      )
    : url;
};

const normalize = (_match: Match, incoming?: boolean): MatchNormal => {
  if (typeof _match === 'function') return _match;

  const originalMatch = isPlainObject(_match) ? { ...(_match as MatchObject) } : _match;

  let match: MatchObject;

  if (!isPlainObject(_match)) {
    match = {
      url: _match
    } as MatchObject;
  } else {
    // shallow copy
    match = {
      // @ts-ignore
      ..._match
    } as MatchObject;
  }

  match.query = isEmpty(match.query) ? undefined : match.query;
  match.headers = isEmpty(match.headers)
    ? undefined
    : Object.entries(match.headers as Record<string, MatchString>).reduce((acc, [k, v]) => {
        acc[k.toLowerCase()] = v;
        return acc;
      }, {} as Record<string, MatchString>);

  if (!match.method || match.method === 'all' || match.method === 'ALL' || match.method === '*') {
    delete match.method;
  } else if (typeof match.method === 'string') {
    match.method = match.method.toLowerCase() as Method;
  }

  const $meta = { ...(match.$meta || {}) };

  if (match.path) {
    match.url = match.path;
    delete match.path;
  }

  if (match.url === '*') {
    delete match.url;
  }

  if (typeof match.url === 'string') {
    match.url = makeRequestUrl(match.url);

    const stripped = stripQuery(match.url);

    match.url = stripped.url.replace(/\/+$/, '') || '/';

    match.query = isPlainObject(match.query)
      ? { ...stripped.query, ...match.query }
      : match.query || stripped.query;
  }

  if (isEmpty(match.query)) {
    delete match.query;
  }

  if (isEmpty(match.cookies)) {
    delete match.cookies;
  }

  const originalNormal = {
    ...match
  };

  if (!match.url) {
    originalNormal.url = '*';
  }

  $meta.original = originalMatch;
  $meta.originalNormal = originalNormal;
  $meta.originalSerialized = serializeObject(originalNormal);

  const { url } = match;

  if (typeof match.url === 'string') {
    if (!incoming) {
      const matchKeys: pathToRegexp.Key[] = [];
      // `pathToRegexp` mutates `matchKeys` to contain a list of named parameters
      const regex = pathToRegexp(encodeProtocolAndPort(match.url), matchKeys);
      match.url = u => regex.test(encodeProtocolAndPort(u) || encodeProtocolAndPort(`/${u}`));
      $meta.regex = regex;
      $meta.matchKeys = matchKeys;
      $meta.fn = match.url.toString();
      match.url.toStringForMatchDeep = () => `"${url?.toString()}"`;
    }
  } else if (isRegExp(match.url)) {
    if (!incoming) {
      const regex = match.url;
      match.url = u =>
        regex.test(decodeProtocolAndPort(u)) || regex.test(decodeProtocolAndPort(`/${u}`));
      $meta.regex = regex;
      $meta.fn = match.url.toString();
      match.url.toStringForMatchDeep = () => url?.toString();
    }
  } else if (typeof match.url === 'function') {
    const fn = match.url;
    match.url = u => fn(u) || fn(`/${u}`);
  }

  return { ...match, $meta } as MatchNormal;
};

export { stripQuery };

export { normalize };
