const { resolve } = require('path');

const { dependencies, devDependencies } = require(resolve('./package.json'));

let failed = false;

for (const name of Object.keys(dependencies)) {
  const version = dependencies[name];

  if (version[0] !== '^') {
    console.error(`dependency "${name}" should start with a carat, but is (${version}) instead`);
    failed = true;
  }
}

for (const name of Object.keys(devDependencies)) {
  const version = devDependencies[name];

  if (version[0] === '^') {
    console.error(`devDependency ${name} should be ${version.substr(1)} as opposed to ${version}`);
    failed = true;
  }
}

if (failed) {
  console.warn('There were invalid version settings detected in the package.json file.');
  process.exit(1);
}
