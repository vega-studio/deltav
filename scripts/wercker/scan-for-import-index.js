const { readdir, readFile, stat } = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

const readdirP = promisify(readdir);
const readFileP = promisify(readFile);
const statP = promisify(stat);

const RE_INDEX = /import.*from.*(index|"conversation-chart)/i;

/**
 * Process dir and all its subdirectories for import problems
 *
 * @param {string} dir The directory to process
 */
async function processDir(dir) {
  const files = await readdirP(dir);

  for (const file of files) {
    // Ignore certain things
    if (['.git', '.vscode', '.', '..'].indexOf(file) !== -1) continue;
    const fullFile = resolve(dir, file);
    const stats = await statP(fullFile);

    if (stats.isDirectory()) await processDir(fullFile);
    else {
      const data = await readFileP(fullFile, { encoding: 'utf-8' });
      const matches = data.match(RE_INDEX);

      if (matches) {
        console.error(`${fullFile}: File contains an index import: \n${matches[0]}`);
        process.exitCode = 1;
      }
    }
  }
}

/** The main entry point for this script */
async function main() {
  await processDir(resolve('src'));
}

process.on('unhandledRejection', error => {
  console.error('UNHANDLED REJECTION:', error.stack || error);
  process.exit(1);
});

main()
.catch(error => {
  console.error('ERROR', error.stack || error);
  process.exitCode = 1;
});
