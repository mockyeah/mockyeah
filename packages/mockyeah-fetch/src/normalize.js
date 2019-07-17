import { parse } from 'url';
import qs from 'qs';

const stripQuery = u => {
  const parsed = parse(u);

  return {
    url: `${parsed.protocol || 'http:'}//${parsed.host}${
      parsed.port && ![80, 443].includes(parsed.port) ? `:${parsed.port}` : ''
    }`,
    query: qs.parse(parsed.query)
  };
};

const normalize = match => {
  if (typeof match === 'string') {
    match = {
      url: match
    };
  }

  if (!match.method) {
    match.method = 'get';
  } else if (typeof match.method === 'string') {
    match.method = match.method.toLowerCase();
  }

  if (match.url && typeof match.url === 'string') {
    const stripped = stripQuery(match.url);
    match.url = stripped.url.replace(/\/$/, '');
    match.query =
      typeof match.query === 'function' ? match.query : { ...stripped.query, ...match.query };
  }

  if (match.path && typeof match.path === 'string') {
    const stripped = stripQuery(match.path);
    match.path = stripped.url.replace(/\/$/, '');
    match.query =
      typeof match.query === 'function' ? match.query : { ...stripped.query, ...match.query };
  }

  return match;
};

export { stripQuery };

export default normalize;
