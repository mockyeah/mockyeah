'use strict';

const defaultDebug = value => value || 'mockyeah:*';

// TODO: Support browser.
process.env.DEBUG = defaultDebug(process.env.DEBUG);

const debug = require('debug');

/* eslint-disable no-console, prefer-destructuring */

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
    args.types = ['info'];
    args.message = arguments[0];
    args.verbose = arguments[1];
  } else if (arguments.length === 2) {
    args.types = arguments[0];
    args.message = arguments[1];
  }

  // Coerce types string to array
  args.types = Array.isArray(args.types) ? args.types : [args.types];

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
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

  const logTypesDebugMessage = args.types.map(type => type.toLowerCase()).join(':');

  const debugLog = debug(`${this.name}:${logTypesDebugMessage}`);

  debugLog.log = console.log.bind(console);

  debugLog(`[${timestamp}] ${args.message}`);
};

module.exports = Logger;
