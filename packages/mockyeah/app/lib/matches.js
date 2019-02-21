const { isEqual, isObject, isRegExp } = require('lodash');

const stringify = value => {
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch (error) {
    return value;
  }
};

const makeMatcher = ({ shortCircuit } = {}) => {
  const errors = [];

  const matcher = (value, source, keyPath = []) => {
    if (isRegExp(source)) {
      const result = source.test(value);
      if (!result)
        errors.push({
          message: `Regex \`${source}\` does not match value \`${stringify(value)}\``,
          keyPath
        });
    } else if (typeof source === 'number') {
      const result = (source && source.toString()) === (value && value.toString());
      if (!result)
        errors.push({
          message: `Number \`${source}\` and value \`${value}\` not equal`,
          keyPath
        });
    } else if (typeof source === 'function') {
      try {
        const result = source(value);
        if (result !== undefined && !result)
          errors.push({
            message: `Value \`${stringify(value)}\` does not pass function${
              source.name ? ` \`${source.name}\`` : ''
            }`,
            keyPath
          });
      } catch (error) {
        errors.push({
          message:
            error && error.message
              ? error.message
              : `Threw error without message \`${stringify(error)}\``,
          keyPath
        });
      }
    } else if (isObject(value) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (shortCircuit && errors.length) return;
        matcher(value[key], source[key], [...keyPath, key]);
      });
    } else {
      const result = isEqual(value, source);
      if (!result)
        errors.push({
          message: `Expected \`${stringify(source)}\` and value \`${stringify(value)}\` not equal`,
          keyPath
        });
    }
  };

  return { errors, matcher };
};

const matches = (value, source, { shortCircuit } = {}) => {
  const { errors, matcher } = makeMatcher({
    shortCircuit
  });

  matcher(value, source);

  const result = !errors.length;

  const message = errors.length
    ? errors
        .map(
          error =>
            `${error.message}${error.keyPath.length ? ` for "${error.keyPath.join('.')}"` : ''}`
        )
        .join(' ')
    : undefined;

  return {
    result,
    message,
    errors
  };
};

module.exports = matches;
