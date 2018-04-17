const { exec } = require('auto');
const { compare, inc } = require('semver');
const { readFile, writeFile } = require('fs');
const { promisify } = require('util');

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);

if (process.argv.indexOf('--help') !== -1) {
  console.log(`
usage: release-notes (major|minor|patch)

Run this script with the release type you're trying to make as the first
argument, and it will generate release notes for you and update RELEASE_NOTES.md
automagically. If there is no RELEASE_NOTES file, then one will be created for
you.
`);
  process.exit(0);
}

/** Main entry point for the script */
async function main() {
  const RELEASE_TYPE = process.argv[2];

  const LAST_VERSION = (await exec('git', ['tag', '-l'])).split('\n')
  .filter(Boolean)
  .sort(compare)
  .slice(-1)[0];

  const NEXT_VERSION = inc(LAST_VERSION, RELEASE_TYPE);

  if (!NEXT_VERSION) {
    console.error(`Invalid release type "${RELEASE_TYPE}"
Try ${process.argv[0]} ${process.argv[1]} (major|minor|patch)`);
    process.exit(1);
  }

  const changes = (await exec('git', ['log', `${LAST_VERSION}..HEAD`]))
  .split('\n')
  .filter(line => /^\s+(\w+):(.+)$/.test(line))
  ;

  let newNotes = `## ${NEXT_VERSION}\n\n`;

  newNotes += changes.map(line => {
    const [, type, message] = line.match(/^\s+(\w+):(.+)$/);
    return `* \`(${type.toUpperCase()})\` ${message.trim()}`;
  })
  .join('\n');

  let releaseNotes = await readFileP('RELEASE_NOTES.md', { encoding: 'utf-8' })
  .catch(() => '# Release Notes\n\n');

  releaseNotes = releaseNotes.replace(/(?=##|$)/, `${newNotes}\n\n`);
  await writeFileP('RELEASE_NOTES.md', releaseNotes);

  console.log(newNotes);
}

process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error.stack || error);
  process.exit(1);
});

main()
.catch(error => {
  console.error(error);
  process.exitCode = 1;
});
