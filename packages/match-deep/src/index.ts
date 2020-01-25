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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deserializeRegex = (input: any): RegExp | void => {
  if (!isObject(input)) return;

  const rinput = input as { $regex?: string | { source: string; flags?: string } };

  if (!rinput.$regex) return;

  let source;
  let flags;

  if (typeof rinput.$regex === 'string') {
    source = rinput.$regex;
  } else {
    source = rinput.$regex.source;
    flags = rinput.$regex.flags;
  }

  // eslint-disable-next-line consistent-return
  return new RegExp(source, flags);
};

interface MatchOptions {
  shortCircuit?: boolean;
  // TODO: Support skip keys as singular, as regex, as functions, etc.
  skipKeys?: string[];
  serializedRegex?: boolean;
}

interface MatchError {
  message: string;
  keyPath: string[];
}

const DEFAULT_MATCH_OPTIONS: MatchOptions = {};

const makeMatcher = (options = DEFAULT_MATCH_OPTIONS) => {
  const { shortCircuit, skipKeys, serializedRegex } = options;
  const errors: MatchError[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const internalMatcher = (value: any, source: any, keyPath: string[]) => {
    // eslint-disable-next-line no-nested-ternary
    const deserializedRegex = isRegExp(source)
      ? source
      : serializedRegex
      ? deserializeRegex(source)
      : undefined;
    if (deserializedRegex) {
      const result = deserializedRegex.test(value);
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
        .join('. ')
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
