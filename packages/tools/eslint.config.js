module.exports = {
  plugins: ['node'],
  extends: ['airbnb/base', 'prettier', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 2015
  },
  env: {
    node: true,
    mocha: true,
    es6: true
  },
  rules: {
    strict: [0, 'safe'],
    'no-param-reassign': 0,
    'no-shadow': 1,
    'comma-dangle': [2, 'never'],
    'no-unused-vars': 1,
    'space-before-function-paren': 0,
    'new-cap': 0,
    'eol-last': 0,
    'prefer-arrow-callback': 0,
    'arrow-parens': [0, 'as-needed'],
    'prefer-rest-params': 0,
    'prefer-spread': 0,
    'no-new-require': 2,
    'no-path-concat': 2,
    'no-process-exit': 2,
    'no-sync': 2,
    'no-mixed-requires': 1,
    'callback-return': 0,
    'handle-callback-err': 0,
    'node/no-unpublished-require': 0
  }
};
