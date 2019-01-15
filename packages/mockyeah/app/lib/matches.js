const { isMatchWith, isRegExp } = require('lodash');

const SKIP = {};

// eslint-disable-next-line consistent-return
function customizer(object, source, skip) {
  if (isRegExp(source)) {
    if (!source.test(object)) throw new Error(`value "${object}" does not match regex "${source}"`);
    if (skip === SKIP) return SKIP;
  } else if (typeof source === 'number') {
    if (source.toString() !== object)
      throw new Error(`number "${source}" does not match "${object}"`);
    if (skip === SKIP) return SKIP;
  } else if (typeof source === 'function') {
    const result = source(object);
    // if the function returns undefined, we'll skip this to fallback
    if (result !== undefined && !result)
      throw new Error(
        `value ${object} does not pass function${source.name ? ` "${source.name}"` : ''}`
      );
    if (skip === SKIP) return SKIP;
  }
  // else return undefined to fallback to default equality check
}

// eslint-disable-next-line consistent-return
const matches = (object, source, options = {}) => {
  const { throws } = options;

  try {
    const result = customizer(object, source, SKIP);

    if (!throws && result === SKIP) return true;

    isMatchWith(object, source, customizer);

    if (!throws) return true;
  } catch (err) {
    if (throws) throw err;

    return false;
  }
};

module.exports = matches;
