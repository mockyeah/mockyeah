import isObject from 'lodash/isObject';
import isRegExp from 'lodash/isRegExp';
import isEqual from 'lodash/isEqual';

const stringify = (value: any) => {
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch (error) {
    return value;
  }
};

interface MatchOptions {
  shortCircuit?: boolean;
  // TODO: Support skip keys as singular, as regex, as functions, etc.
  skipKeys?: string[];
}

interface MatchError {
  message: string;
  keyPath: string[];
}

const DEFAULT_MATCH_OPTIONS: MatchOptions = {};

const makeMatcher = ({ shortCircuit, skipKeys } = DEFAULT_MATCH_OPTIONS) => {
  const errors: MatchError[] = [];

  const internalMatcher = (value: any, source: any, keyPath: string[]) => {
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
        if (skipKeys && skipKeys.includes(key)) return;
        if (shortCircuit && errors.length) return;
        // @ts-ignore
        internalMatcher(value[key], source[key], [...keyPath, key]);
      });
    } else if (typeof source !== 'undefined') {
      const result = isEqual(value, source);
      if (!result)
        errors.push({
          message: `Expected \`${stringify(source)}\` and value \`${stringify(value)}\` not equal`,
          keyPath
        });
    }
  };

  const matcher = (value: any, source: any) => internalMatcher(value, source, []);

  return { errors, matcher };
};

const matches = (value: any, source: any, options?: MatchOptions) => {
  const { errors, matcher } = makeMatcher(options);

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
    value,
    source,
    result,
    message,
    errors
  };
};

export default matches;
