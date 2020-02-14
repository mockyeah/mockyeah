const tools = require("@mockyeah/tools/.eslintrc.js");

const rules = {
  ...tools.rules,
  "@typescript-eslint/ban-ts-ignore": 0,
  "import/extensions": 0,
  "import/no-unresolved": 0,
  "no-undef": 0,
  "react/prop-types": 0,
  "react/no-unescaped-entities": 0,
  "react-hooks/rules-of-hooks": 0,
  "react-hooks/exhaustive-deps": 0,
  "no-console": 0
};

delete rules["node/no-unpublished-require"];

module.exports = {
  ...tools,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint/eslint-plugin", "react", "react-hooks"],
  extends: [
    "airbnb-base",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  rules,
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    }
  }
};
