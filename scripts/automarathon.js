console.log('Automarathon');
const { readdirSync } = require('fs');
const { resolve } = require('path');
const { spawnSync } = require('child_process');
const { v2: { uploader } } = require('cloudinary');
const requestPromise = require('request-promise');

const RESULTS_DIR = 'test/marathon/results';

const {
  AUTORELEASE_TOKEN,
  WERCKER_GIT_BRANCH,
  WERCKER_GIT_OWNER,
  WERCKER_GIT_REPOSITORY,
} = process.env;

const github = options => {
  const parameters = Object.assign({}, {
    uri: `https://api.github.com/repos/${WERCKER_GIT_OWNER}/${WERCKER_GIT_REPOSITORY}/${options.url}`,
    method: 'GET',
    headers: Object.assign({}, {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${AUTORELEASE_TOKEN}`,
      'User-Agent': 'tarwich'
    }, options.headers || {}),
    json: true,
  }, options, { url: undefined });
  return requestPromise(parameters)
  // Log the result and return it
  .then(result => console.log(result) || result)
  // Log the error and return a formatted object with the error
  .catch(error => console.error('ERROR:', error) || { error });
};

(async() => {
  // Ensure this is a PR
  console.log('Checking for a PR...');
  const pullRequests = await github({
    url: 'pulls',
    qs: {
      head: `${WERCKER_GIT_OWNER}:${WERCKER_GIT_BRANCH}`,
      state: 'open'
    },
  });
  if (pullRequests.error) process.exit(1);

  if (pullRequests.length === 0) {
    console.log('Not a PR. Refusing to run marathon tests.');
    process.exit(0);
  }

  // Run marathon
  console.log('Running marathon tests');
  spawnSync('node', ['test/marathon',
    '--save-images',
    '--timeout', '3 minutes'
  ], { stdio: 'inherit' });

  // Get all the images
  const files = readdirSync(RESULTS_DIR)
  .filter(s => /\.png$/.test(s));

  // Upload all the images
  console.log('Uploading images...');
  const uploads = await Promise.all(files.map(file =>
    uploader.upload(resolve(RESULTS_DIR, file))
    .catch(error => {
      console.log('ERROR:', error);
      return {};
    })
    .then(result => ({ file, result }))
  ));
  console.log(uploads);

  // Comment on the PR
  const pullRequest = pullRequests[0];
  let markdown = '';
  markdown += '## Marathon Results\n';

  markdown += uploads.map(upload =>
    `<img src="${upload.result.url}" width="200" title="${upload.file}" /> `
  );

  await github({
    method: 'POST',
    url: `issues/${pullRequest.number}/comments`,
    body: {
      body: markdown,
    },
  })
  // If there's an error then return a failure code
  .then(result => result.error && process.exit(1));
})();

// AUTORELEASE_TOKEN
