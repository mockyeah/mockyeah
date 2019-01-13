const { isMatchWith, isRegExp } = require('lodash');

// eslint-disable-next-line consistent-return
function customizer(object, source) {
  if (isRegExp(source)) {
    return source.test(object);
  } else if (typeof source === 'number') {
    return source.toString() === object;
  } else if (typeof source === 'function') {
    const result = source(object);
    // if the function returns undefined, we'll skip this to fallback
    if (result !== undefined) return result;
  }
  // else return undefined to fallback to default equality check
}

const matches = (object, source) => isMatchWith(object, source, customizer);

module.exports = matches;
