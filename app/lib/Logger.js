'use strict';
/* eslint-disable no-console */

const hasCustomType = args => args.length >= 2;

const verbose = args => {
  let _verbose = hasCustomType(args) ? args[2] : args[1];
  return _verbose === undefined ? true : _verbose;
}

/**
 * Logger function
 * @param {String|Array} [type=INFO] - Types string(s) to preprend output.
 * @param {String} message - Text to output.
 * @param {Boolean} [verbose=true] - Suppresses output when false.
 * @return {undefined}
 */
module.exports = function log(/* [type=INFO], message, [verbose=true] */) {
  const _hasCustomType = hasCustomType(arguments);
  const _verbose = verbose(arguments);

  // Suppress output when not verbose
  if (_verbose === false) return;

  const message = _hasCustomType ? arguments[1] : arguments[0];
  let types = _hasCustomType ? arguments[0] : 'info';

  // Coerce String to Array
  types = Array.isArray(types) ? types : [types];

  // Prepare string of types for output
  types = types.reduce((result, value) => {
    return `${result}[${value.toUpperCase()}]`
  }, '')

  console.log(`[mockyeah]${types} ${message}`);
};
