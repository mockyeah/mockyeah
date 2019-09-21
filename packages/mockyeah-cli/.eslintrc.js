const tools = require('@mockyeah/tools/.eslintrc.js');

module.exports = {
  ...tools,
  env: {
    ...tools.env,
    jest: true
  }
};
