const { sh } = require('./lib/exec');

const ENSURE_REMOTE = 'origin';
const ENSURE_REMOTE_PROJECT = 'git@github.com:vega-studio/deltav.git';

// We check our remote to ensure we have a projected with expected values
const remoteListProcess = sh('git', 'remote', '-v');

if (remoteListProcess.code !== 0) {
  console.log('Could not list remotes for the git project.');
  process.exit(1);
}

const remotes = remoteListProcess.stdout.toString().split(/\r?\n/g);

const foundRemote = remotes.find(row =>
  row.indexOf(ENSURE_REMOTE) >= 0 && row.indexOf(ENSURE_REMOTE_PROJECT) >= 0
);

if (!foundRemote) {
  console.log(
    'The project must have the listed remote and specified project',
    ENSURE_REMOTE,
    ENSURE_REMOTE_PROJECT
  );
  process.exit(1);
}

// Make sure we're on a release branch that matches dev
if (sh('git', 'checkout', 'release').code !== 0) {
  if (sh('git', 'checkout', '-b', 'release').code !== 0) {
    console.log('Could not switch to the release branch. Make sure the branch exists locally.');
    process.exit(1);
  }
}

// Make sure we have the latest from the remote
if (sh('git', 'fetch', '--all').code !== 0) {
  console.log('Could not fetch from remote servers.');
  process.exit(1);
}

// Make sure we are exactly what is in dev
if (sh('git', 'reset', '--hard', `${ENSURE_REMOTE}/dev`).code !== 0) {
  console.log('Could not reset branch to dev');
  process.exit(1);
}

// Build declaration files
if (
  sh(
    'tsc',
    '-d',
    '--emitDeclarationOnly',
    '--outDir',
    'dist',
    '--project',
    './tsconfig.json'
  ).code !== 0
) {
  console.log('Failed to compile type declarations');
  process.exit(1);
}

// Build the monolithic distribution
if (sh('node', 'scripts/build').code !== 0) {
  console.log('Failed to compile distribution');
  process.exit(1);
}

// Clean out the compiled test file typings
if (sh('-rf', 'rm', '-rf', 'dist/test').code !== 0) {
  console.log('Failed to clean distribution');
  process.exit(1);
}

// Ensure all fragments are going to be included in the commit
if (sh('git', 'add', '-A').code !== 0) {
  console.log('Could not ensure all fragments are added for the next commit.');
  process.exit(1);
}

// Have this execute the runner release notes script
// NOTE: this creates a commit with the latest version
if (
  sh(
    'npm',
    'run',
    'runner',
    '--',
    'release-notes',
    '--file',
    'RELEASE_NOTES.md',
    '--update-package'
  ).code !== 0
) {
  console.log('Failed to update release fragments');
  process.exit(1);
}

// Get the version generated by the runner release notes commit
const lastCommitProcess = sh('git', 'log', '-1', '--pretty=%B');

if (lastCommitProcess.code !== 0) {
  console.log('Could not read the last commit version information');
  process.exit(1);
}

const version = (lastCommitProcess.stdout.trim().toLowerCase().split('release ')[1] || '').trim();

if (!version) {
  console.log('Could not determine release version from the last commit');
  process.exit(1);
}

// Tag the commit with the version number
if (sh('git', 'tag', '-a', 'version', '-m', `Release ${version}`).code !== 0) {
  console.log('Could not make tag for git commit');
  process.exit(1);
}

// Push the commit to remote release branch
if (sh('git', 'push', ENSURE_REMOTE, '-f', 'release').code !== 0) {
  console.log(`Could not push release commit to ${ENSURE_REMOTE}`);
  process.exit(1);
}

// Push the tag to remote
if (sh('git', 'push', ENSURE_REMOTE, version).code !== 0) {
  console.log('Could not push tag to the remote repository');
  process.exit(1);
}
