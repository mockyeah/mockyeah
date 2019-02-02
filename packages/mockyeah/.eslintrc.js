const tools = require('mockyeah-tools/.eslintrc.js');

module.exports = Object.assign({}, tools, {
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'func-names': 0,
        'no-unused-expressions': 0
      }
    }
  ]
});
