const { resolve } = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
.BundleAnalyzerPlugin;

console.log('NODE_ENV', process.env.NODE_ENV);

// This is an optional path that can be passed into the program. When set, the
// project will use the source code from the webgl project specified instead of
// the internally installed version. It can be set by environment variable, or
// by calling --devgl
const DEVGL = process.env.DEVGL;
const IS_HEROKU = process.env.NODE_ENV === 'heroku';
const IS_RELEASE = process.env.NODE_ENV === 'release';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || IS_RELEASE;
const IS_UNIT_TESTS = process.env.NODE_ENV === 'unit-test';
const IS_DEVELOPMENT =
  process.env.NODE_ENV === 'development' || IS_UNIT_TESTS || IS_HEROKU;
const MODE =
  process.env.MODE || IS_RELEASE | IS_PRODUCTION ? 'production' : 'development';

const tslint = {
  loader: 'tslint-loader',
  options: {
    fix: false,
    emitErrors: true
  }
};

const prettier = {
  loader: resolve('prettier-loader.js')
};

const babelOptions = {
  babelrc: false,
  presets: [
    [
      'env',
      {
        targets: {
          browsers: [
            'last 2 Chrome versions',
            'last 2 Safari versions',
            'last 2 Firefox versions',
            'last 2 Edge versions'
          ]
        },
        modules: false
      }
    ]
  ]
};

const plugins = [];
let externals = [];
let library;
let libraryTarget;

if (IS_DEVELOPMENT) {
  plugins.push(
    new CircularDependencyPlugin({
      exclude: /\bnode_modules\b/,
      failOnError: true
    })
  );

  if (process.env.DEBUG_PACKAGE) plugins.push(new BundleAnalyzerPlugin());
}

if (IS_PRODUCTION) {
  // List our external libs for the library generation so they do
  // not get bundled into ours
  externals = [];

  // We are bundling a library so set the output targets correctly
  library = 'network-bubble-chart';
  libraryTarget = 'umd';

  // We should minify and mangle our distribution for npm
  console.log('Minification enabled');
}

let entry = 'src';
if (IS_DEVELOPMENT || IS_HEROKU) entry = 'test';
if (IS_UNIT_TESTS) entry = 'unit-test';

let path = resolve(__dirname, 'build');
if (IS_PRODUCTION) path = resolve(__dirname, 'dist');
if (IS_UNIT_TESTS) path = resolve(__dirname, 'unit-test', 'build');

module.exports = {
  devtool: 'source-map',
  entry,
  externals,
  mode: MODE,

  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: [
          { loader: 'babel-loader', options: babelOptions },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: IS_PRODUCTION || IS_UNIT_TESTS || IS_HEROKU
            }
          }
        ]
      },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
      {
        test: /\.html$/,
        use: { loader: 'file-loader', options: { name: '[name].html' } }
      },
      { test: /\.png$/, loader: 'base64-image-loader' },
      { test: /\.obj$/, use: ['raw-loader'] },
      { test: /\.mtl$/, use: ['raw-loader'] },
      { test: /\.[fv]s$/, use: IS_PRODUCTION ? ['shader-compress-loader'] : ['raw-loader'] },
      {
        test: /\.(mp4|mov)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },

  output: {
    library,
    libraryTarget,
    path,
    filename: 'index.js'
  },

  plugins,

  resolve: {
    modules: ['.', './node_modules', './src'],
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: DEVGL ? {
      '@voidrayco/voidgl$': DEVGL,
    } : undefined,
  },

  resolveLoader: {
    modules: ['node_modules', 'loaders']
  }
};

if (IS_DEVELOPMENT) {
  module.exports.module.rules.unshift({
    test: /\.tsx?/,
    exclude: DEVGL,
    use: [prettier, tslint],
    enforce: 'pre'
  });
}
