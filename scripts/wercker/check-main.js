const { readFileSync } = require('fs');
const { resolve } = require('path');

const data = readFileSync(resolve('./test/main.tsx'));
const CORRECT_FILE = './test-data/kitchen-sink';

const match = /testData\s*=\s*require\(['"'](.*?)["'"]\)/.exec(data);
const file = match && match[1] || '';
let correctData = false;

if (file === CORRECT_FILE) correctData = true;
console.log(`main.tsx data source: ${file}`);

if (!correctData) {
  console.error(
    `test/main.tsx should refer to the kitchen sink json file: ${CORRECT_FILE}`
  );
  process.exit(1);
}
