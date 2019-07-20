const { resolve } = require('path');

module.exports = {
  extends: resolve('node_modules/eslint-config-voidray/index.js'),
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
  },
  rules: {
    camelcase: ['error', {properties: 'never'}],
    "require-jsdoc": [0],
    "default-case": [0],
    "quotes": [0],
    "valid-jsdoc": [0],
    "curly": [0]
  },
};
