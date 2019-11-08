const _ = require('lodash');

const modifyMockForMockyeahFetch = (app, match, _resOpts, method) => {
  // eslint-disable-next-line no-underscore-dangle
  const matchWithMethod = _.isPlainObject(match) ? Object.assign({}, match) : { url: match };
  matchWithMethod.method = matchWithMethod.method || method;

  return [matchWithMethod, _resOpts];
};

module.exports.modifyMockForMockyeahFetch = modifyMockForMockyeahFetch;
