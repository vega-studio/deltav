/**
 * You MUST set these env variables to make this script work correctly.
 *
 * process.env.AWS_ACCESS_KEY_ID = '';
 * process.env.AWS_SECRET_ACCESS_KEY = '';
 * process.env.AWS_BUCKET = '';
 *
 */

const { resolve } = require('path');

async function awsUpload() {
  const packageJson = require(resolve('package.json'));
  const upload = require('auto/actions/aws-upload');
  const DIST_FOLDER = resolve('dist');

  const {
    AWS_BUCKET
  } = process.env;

  // We only attempt an upload if the AWS_BUCKET is specified
  if (!AWS_BUCKET) {
    return;
  }

  console.log('\n------AWS Upload------');

  // Tar the dist folder contents and upload to S3 so projects can reference the library
  // We get the Bucket Key and Resource Path from AWS_BUCKET but we provide the file name
  // dynamically from this process.
  await upload({
    awsFileName: `${packageJson.version}.tar`,
    directory: DIST_FOLDER,
    makePublic: true,
    tarPath: resolve('dist.tar'),
  });

  console.log('AWS Upload complete');
}

awsUpload();
