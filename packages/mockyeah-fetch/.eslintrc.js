const tools = require('mockyeah-tools/.eslintrc.js');

const rules = {
  ...tools.rules
};

delete rules['node/no-unpublished-require'];

module.exports = {
  ...tools,
  extends: ['airbnb/base', 'prettier'],
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  rules
};
