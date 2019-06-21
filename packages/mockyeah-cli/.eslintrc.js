const tools = require('mockyeah-tools/.eslintrc.js');

module.exports = Object.assign({}, tools, {
  env: Object.assign({}, tools.env, {
    jest: true
  })
});
