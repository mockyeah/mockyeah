const tools = require('@mockyeah/tools/.eslintrc.js');

module.exports = Object.assign({}, tools, {
  globals: {
    fetch: 'readonly'
  },
  rules: Object.assign({}, tools.rules, {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/test/**']
      }
    ]
  }),
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
