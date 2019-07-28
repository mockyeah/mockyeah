import { parse } from 'url';
import qs from 'qs';
import pathToRegExp from 'path-to-regexp';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';

const decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
const decodedProtocolRegex = /^(\/?https?).{3}/;
const encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
const encodedProtocolRegex = /^(\/?https?).{3}/;

const decodeProtocolAndPort = str =>
  str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');

const encodeProtocolAndPort = str =>
  str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');

const stripQuery = u => {
  const parsed = parse(u);

  return {
    url: `${parsed.protocol || 'http:'}//${parsed.host}${
      parsed.port && ![80, 443].includes(parsed.port) ? `:${parsed.port}` : ''
    }`,
    query: qs.parse(parsed.query)
  };
};

const normalize = (match, incoming) => {
  if (!isPlainObject(match)) {
    match = {
      url: match
    };
  } else {
    // shallow copy
    match = {
      ...match
    };
  }

  if (match.path) {
    match.url = match.path;
    delete match.path;
  }

  if (match.url === '*') {
    delete match.url;
  }

  if (typeof match.url === 'string') {
    const stripped = stripQuery(match.url);
    match.url = stripped.url.replace(/\/$/, '');
    if (!incoming) {
      const regex = pathToRegExp(encodeProtocolAndPort(match.url));
      match.url = u => regex.test(encodeProtocolAndPort(u));
    }
    match.query = isPlainObject(match.query) ? { ...stripped.query, ...match.query } : match.query;
    match.query = isEmpty(match.query) ? undefined : match.query;
  }

  if (!match.method) {
    match.method = 'get';
  } else if (typeof match.method === 'string') {
    match.method = match.method.toLowerCase();
  }

  return match;
};

export { stripQuery };

export default normalize;
