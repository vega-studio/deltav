const { resolve } = require('path');
const serve = require('webpack-serve');

process.env.NODE_ENV = 'development';
serve({
  config: {
    ...require(resolve('webpack.config.js')),
    serve: {
      port: process.env.PORT || 8080,
    },
  }
});
