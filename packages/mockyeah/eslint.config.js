const tools = require('tools/eslint.config.js');

module.exports = {
  ...tools,
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'func-names': 0
      }
    }
  ]
};
