const { resolve } = require('path');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

const tslintLoader = {loader: 'tslint-loader', options: {
  fix: true,
  emitErrors: true,
}};

const IS_RELEASE = process.env.NODE_ENV === 'release';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || IS_RELEASE;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const plugins = [];

let externals = [];
let library;
let libraryTarget;

if (IS_DEVELOPMENT)
  plugins.push(new ForkTsCheckerWebpackPlugin());

if (IS_PRODUCTION) {
  // List our external libs for the library generation so they do
  // not get bundled into ours
  externals = [
    'd3-color',
    'd3-scale',
    'ramda',
    'react-dom',
    'react',
    'three',
    'bowser',
  ];

  // We are bundling a library so set the output targets correctly
  library = 'voidgl';
  libraryTarget = 'umd';

  // We should minify and mangle our distribution for npm
  console.log('Minification enabled');

  // Add in uglify to handle minification
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: true
        },
      },
      sourceMap: true,
    })
  );
}

module.exports = {
  entry: IS_PRODUCTION ? './src' : './test',
  externals,

  module: {
    rules: [
      {test: /\.tsx?/, use: tslintLoader, enforce: 'pre'},
      {test: /\.tsx?/, use: {loader: 'ts-loader', options: {transpileOnly: IS_DEVELOPMENT}}},
      {test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']},
      {test: /index.html$/, use: {loader: 'file-loader', options: {name: 'index.html'}}},
      {test: /\.[fv]s$/, use: ['raw-loader']}, // Currently used to load shaders into javascript files
    ],
  },

  output: {
    filename: IS_PRODUCTION ? 'index.js' : 'app.js',
    library,
    libraryTarget,
    path: IS_PRODUCTION ? resolve('dist') : resolve('build'),
    publicPath: '/',
  },

  plugins,

  resolve: {
    modules: ['./node_modules', './src'],
    extensions: ['.ts', '.tsx', '.js'],
  },
};
