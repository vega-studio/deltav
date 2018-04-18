const { exec } = require('auto');
const { inc, lt, valid } = require('semver');
const { readFile, writeFile } = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const RE_EMOJI = new RegExp('([\\uE000-\\uF8FF]|\\uD83C[\\uDC00-\\uDFFF]|' +
  '\\uD83D[\\uDC00-\\uDFFF]|[\\u2694-\\u2697]|\\uD83E[\\uDD10-\\uDD5D])', 'g');

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

const RELEASE_NOTES_PATH = resolve('.', 'RELEASE_NOTES.md');

/** Aliases of tags we accidentally use from time to time */
const RENAMERS = {
  // Breaking
  breaking: 'breaking',
  major: 'breaking',

  // Added
  added: 'added',
  feature: 'added',
  minor: 'added',
  story: 'added',

  // Fixed
  fix: 'fixed',
  fixed: 'fixed',
  hotfix: 'fixed',
  patch: 'fixed',
};

/** Main entry point for the script */
async function main() {
  const CURRENT_VERSION = (await exec('git', ['tag', '-l']))
  .split('\n')
  .filter(valid)
  .sort(lt)[0];

  console.log(`Current version: ${CURRENT_VERSION}`);

  const changes = (await exec(
    'git',
    CURRENT_VERSION ? ['log', `${CURRENT_VERSION}..HEAD`] : ['log']
  ))
  .split('\n')
  .filter(line => /^\s+(\w+):(.+)$/.test(line));

  // Figure out what kind of release we're making based on the release notes
  const groupedChanges = changes.reduce((groups, line) => {
    const [, typeName, message] = line.match(/^\s+(\w+):(.+)$/)
    .map(text => text.trim());
    const type = RENAMERS[typeName.toLowerCase()];
    if (type) groups[type].push({ type, message });
    else console.log(`! Ignoring change type (${typeName}): ${message}`);
    return groups;
  }, { added: [], fixed: [], breaking: [] });

  console.log('changes: \n', require('util').inspect(groupedChanges, { colors: true }));

  let releaseType = null;
  if (groupedChanges.breaking.length) releaseType = 'major';
  else if (groupedChanges.added.length) releaseType = 'minor';
  else if (groupedChanges.fixed.length) releaseType = 'patch';
  console.log(`Determined release type to be: ${releaseType}`);

  if (!releaseType) {
    console.log('Nothing to release');
    process.exit(0);
  }

  const NEXT_VERSION = inc(CURRENT_VERSION || '0.0.0', releaseType);
  console.log(`Next version: ${NEXT_VERSION}`);

  if (!NEXT_VERSION) {
    console.error(`Invalid release type "${releaseType}"
Try ${process.argv[0]} ${process.argv[1]} (major|minor|patch)`);
    process.exit(1);
  }

  let newNotes = `## ${NEXT_VERSION}\n\n`;

  newNotes += []
  .concat(groupedChanges.breaking)
  .concat(groupedChanges.added)
  .concat(groupedChanges.fixed)
  .map(change => {
    const { type, message } = change;
    return `* \`(${type.toUpperCase()})\` ${message.replace(RE_EMOJI, '').trim()}`;
  })
  .join('\n')
  ;

  let releaseNotes = await readFileP(RELEASE_NOTES_PATH, { encoding: 'utf-8' })
  .catch(() => '# Release Notes\n\n');

  releaseNotes = releaseNotes.replace(/(?=##|$)/, `${newNotes}\n\n`);
  await writeFileP(RELEASE_NOTES_PATH, releaseNotes);

  await exec('git', ['add', RELEASE_NOTES_PATH]);

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
