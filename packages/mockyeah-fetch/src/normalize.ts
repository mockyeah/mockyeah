import { parse } from 'url';
import qs from 'qs';
import pathToRegExp from 'path-to-regexp';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import { MatchObject, Match, Method } from "./types";

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
  let query;

  // is absolute?
  if (/^https?:/.test(url)) {
    const parsed = parse(url);
    url = `${parsed.protocol || 'http:'}//${parsed.hostname}${
      parsed.port && !['80', '443'].includes(parsed.port) ? `:${parsed.port}` : ''
    }${parsed.pathname}`;
    query = parsed.query ? qs.parse(parsed.query) : undefined;
  }

  return {
    url,
    query
  };
};

const normalize = (match: Match, incoming?: boolean) => {
  if (!isPlainObject(match)) {
    match = {
      url: match
    } as MatchObject;
  } else {
    // shallow copy
    match = {
      // @ts-ignore
      ...match
    } as MatchObject;
  }

  if (match.path) {
    match.url = match.path;
    delete match.path;
  }

  if (match.url === '*') {
    delete match.url;
  }

  if (typeof match.url === 'string') {
    match.url = decodeProtocolAndPort(match.url);

    const stripped = stripQuery(match.url);

    match.url = stripped.url.replace(/\/+$/, '');
    match.url = match.url || '/';

    if (!incoming) {
      const regex = pathToRegExp(encodeProtocolAndPort(match.url));
      match.url = u => regex.test(encodeProtocolAndPort(u));
    }

    match.query = isPlainObject(match.query) ? { ...stripped.query, ...match.query } : match.query;
  }

  match.query = isEmpty(match.query) ? undefined : match.query;
  match.headers = isEmpty(match.headers) ? undefined : match.headers;

  if (!match.method) {
    match.method = 'get';
  } else if (match.method === 'all' || match.method === 'ALL' || match.method === '*') {
    delete match.method;
  } else if (typeof match.method === 'string') {
    match.method = match.method.toLowerCase() as Method;
  }

  return match;
};

export { stripQuery };

export default normalize;
