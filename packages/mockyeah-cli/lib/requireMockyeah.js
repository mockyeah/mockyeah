const requireMockyeah = env =>
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(env.modulePath ? env.modulePath : '@mockyeah/server');

module.exports = requireMockyeah;
