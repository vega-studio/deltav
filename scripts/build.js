const { resolve } = require('path');
const webpack = require('webpack');
const program = require('commander');

program
.version('1.0.0', '-v', '--version')
.parse(process.argv);

process.env.NODE_ENV = 'production';

const compiler = webpack(require(resolve('webpack.config.js')));

compiler.compile();

// const server = new DevServer(compiler, {
//   contentBase: resolve('test/assets'),
//   compress: true,
//   port: process.env.PORT || 8080
// });

// server.listen(process.env.PORT || 8080, process.env.HOST || '0.0.0.0', () => {
//   console.log(`Starting server on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 8080}`);
// });
