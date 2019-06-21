const { resolve } = require('path');
const DevServer = require('webpack-dev-server');
const webpack = require('webpack');
const program = require('commander');

program
.version('1.0.0', '-v', '--version')
.option(
  '-t, --release-test',
  `When provided, the dist folder will be used as the folder from
  which files are utilized rather than the src folder.`
)
.option(
  '-p, debug-package',
  'When provided, this will trigger tools that help debug package size and utilization'
)
.parse(process.argv);

// Make sure our processed arguments are applied to the environment
// We do not apply 'undefined' to the env as it will cause an 'undefined' literal string
// to populate the item
if (program.releaseTest) process.env.RELEASE_TEST = true;
if (program.debugPackage) process.env.DEBUG_PACKAGE = true;
process.env.NODE_ENV = 'development';

const compiler = webpack(require(resolve('webpack.config.js')));

const server = new DevServer(compiler, {
  contentBase: resolve('test/assets'),
  compress: true,
  port: process.env.PORT || 8080
});

server.listen(process.env.PORT || 8080, process.env.HOST || '0.0.0.0', () => {
  console.log(`Starting server on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 8080}`);
});
