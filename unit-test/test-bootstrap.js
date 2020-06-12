// Load the correct environment variables
require('dotenv').config({ path: '.env.test' });
// Enable require() to load .ts files
const { resolve } = require('path');
require('ts-node').register({
  project: resolve('tsconfig.json'),
  transpileOnly: true,
});

let first;
function requestAnimationFrame(f) {
  first = first || Date.now();
  setTimeout(() => f(Date.now() - first));
}

if (global && !global.requestAnimationFrame) {
  global.requestAnimationFrame = requestAnimationFrame;
}
