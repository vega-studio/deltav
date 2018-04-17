const { resolve } = require('path');
const DevServer = require('webpack-dev-server');
const webpack = require('webpack');

const PORT = process.env.PORT || 8080;

// Order matters here :)
process.env.NODE_ENV = 'development-voidgl';
const config = require(resolve('webpack.config.js'));

const devServerConfig = {
  historyApiFallback: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
    progress: true,
  },
};

const app = new DevServer(webpack(config), devServerConfig);

app.listen(PORT, () => {
  console.log(`Server is available at http://localhost:${PORT} ...`);
});
