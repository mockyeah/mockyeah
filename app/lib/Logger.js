'use strict';
/* eslint-disable no-console */

/**
 * Logger module
 * @param  {Object} options
 * @return {Instance} Instance of Logger.
 */
const Logger = function Logger(options) {
  options = options || {};

  this.name = options.name;
  this.output = options.output;
  this.verbose = options.verbose;

  return this;
};

/**
 * Prepare log arguments
 * @param {String|Array} [type=INFO] - Types string(s) to preprend output.
 * @param {String} message - Text to output.
 * @param {Boolean} [verbose=true] - Suppresses output when false.
 * @return {undefined}
 */
function prepareArguments(/* [type=INFO], message, [verbose=true] */) {
  const args = {};

  if (arguments.length === 3) {
    args.types = arguments[0];
    args.message = arguments[1];
    args.verbose = arguments[2];
  } else if (arguments.length === 2 && typeof arguments[1] === 'boolean') {
    args.message = arguments[0];
    args.verbose = arguments[1];
  } else if (arguments.length === 2) {
    args.types = arguments[0];
    args.message = arguments[1];
  }

  args.types = args.types || 'info';
  // Coerce types string to array
  args.types = Array.isArray(args.types) ? args.types : [args.types];

  // If verbose value is not passed, message should always output
  args.always = args.verbose === undefined;
  args.verbose = Boolean(args.verbose);

  return args;
}

/**
 * Logger function
 * @param {String|Array} [type=INFO] - Types string(s) to preprend output.
 * @param {String} message - Text to output.
 * @param {Boolean} [verbose=true] - Suppresses output when false.
 * @return {undefined}
 */
Logger.prototype.log = function log(/* [type=INFO], message, [verbose=true] */) {
  const args = prepareArguments.apply(this, arguments);

  // If silencing output, abort
  if (!this.output) return;

  // If verbose is off and message is flagged as verbose output, abort
  if (!this.verbose && args.verbose) return;

  // If message is specified to not display when outputing verbose
  if (this.verbose && !args.always && !args.verbose) return;

  // Explicity indicate verbose messages
  if (args.verbose) args.types.unshift('verbose');

  // Add timestamp to message
  args.types.unshift((new Date()).toLocaleTimeString('en-US', { hour12: false }));

  // Prepare string of types for output
  args.types = args.types.reduce((result, value) => {
    return `${result}[${value.toUpperCase()}]`;
  }, '');

  console.log(`[${this.name}]${args.types} ${args.message}`);
};

module.exports = Logger;