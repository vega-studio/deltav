const { resolve } = require('path');

const { dependencies, devDependencies } = require(resolve('./package.json'));

let failed = false;
const RE_IS_RELATIVE = /(?:^\^|^~|x$)/;

for (const name of Object.keys(dependencies)) {
  const version = dependencies[name];

  if (!RE_IS_RELATIVE.test(version)) {
    console.error(`dependency "${name}" should be relative, but is (${version}) instead`);
    failed = true;
  }
}

for (const name of Object.keys(devDependencies)) {
  const version = devDependencies[name];

  if (RE_IS_RELATIVE.test(version)) {
    console.error(`devDependency ${name} should be absolute as opposed to ${version}`);
    failed = true;
  }
}

if (failed) {
  console.warn('There were invalid version settings detected in the package.json file.');
  process.exit(1);
}
