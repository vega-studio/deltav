const { resolve } = require('path');

module.exports = {
  extends: resolve('node_modules/eslint-config-voidray/index.js'),
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
  },
  rules: {
    camelcase: ['error', {properties: 'never'}]
  },
};
