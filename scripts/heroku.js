//
// This file is created for hosting on Heroku
//
const { createServer } = require('http');
const { parse } = require('url');
const { readFileSync, statSync } = require('fs');
const { resolve } = require('path');
const webpack = require('webpack');

const PORT = process.env.PORT || 80;

let status = 'building';
process.env.NODE_ENV = 'heroku';

console.log('Building...');
const config = require(resolve('webpack.config.js'));
webpack(config).run(error => {
  if (error) throw error;

  else {
    status = 'ready';
    console.log('Server built.');
  }
});

const server = createServer((request, response) => {
  if (status === 'building') {
    response.write('Chill out, dude. We\'re still building the server');
    response.end();
  }
  else if (status === 'ready') {
    try {
      const [requestedFile] = /[\w\.]+$/.exec((parse(request.url).pathname)) || [];
      let localFile = resolve('build', requestedFile || 'index.html');
      try {
        if (!statSync(localFile).isFile()) throw new Error('File not found');
      }
      catch (error) {
        localFile = resolve('build', 'index.html');
      }
      response.write(readFileSync(localFile));
      response.end();
    }
    catch (e) {
      console.error(e);
      response.write('Unable to process request');
      response.end();
    }
  }
  else {
    response.write('This server isn\'t feeling so good');
    response.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is available at http://localhost:${PORT} ...`);
});
