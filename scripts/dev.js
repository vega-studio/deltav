const { resolve } = require('path');
const serve = require('webpack-serve');

// This is an optional path that can be passed into the program. When set, the
// project will use the source code from the webgl project specified instead of
// the internally installed version. It can be set by environment variable, or
// by calling --devgl
let RELEASE_TEST = process.env.RELEASE_TEST;
const args = process.argv;

// Process the args
for (let i = 2; i < args.length; ++i) {
  const [arg] = args.slice(i);

  switch (arg) {
    case '-t':
    case '--release-test':
      // Set the project path as a path
      RELEASE_TEST = true;
      break;

    case '--help':
      console.log(`
Usage: ${0} ${1} «Options»

Options:
  -r --release-test: When provided, the dist folder will be used as the folder from which files are
                     utilized rather than the src folder.
      `);
      break;

    default:
      console.error(`Argument ${arg} not recognized`);
      process.exit(1);
      break;
  }
}

// Make sure our processed arguments are applied to the environment
// We do not apply 'undefined' to the env as it will cause an 'undefined' literal string
// to populate the item
if (RELEASE_TEST) process.env.RELEASE_TEST = RELEASE_TEST;

process.env.NODE_ENV = 'development';
serve({
  config: { ...require(resolve('webpack.config.js')) },
  port: process.env.PORT || 8080,
  host: process.env.HOST || '0.0.0.0',
});
