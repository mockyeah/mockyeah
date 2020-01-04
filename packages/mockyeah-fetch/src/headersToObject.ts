import fromPairs from 'lodash/fromPairs';

const headersToObject = (headers?: Headers): Record<string, string> => {
  if (!headers) return {};

  // @ts-ignore
  if (headers.entries) {
    // @ts-ignore
    const entries = headers.entries();
    return fromPairs([...entries].map(e => [e[0].toLowerCase(), e[1]]));
  }

  if (headers.forEach) {
    const object: Record<string, string> = {};

    headers.forEach((value, name) => {
      object[name] = value;
    });

    return object;
  }

  return {};
};

export { headersToObject };
