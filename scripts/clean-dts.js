/**
 * Occasionally it happens that .d.ts files get generated while managing the build system
 */
const glob = require('glob');
const { unlink } = require('fs');
const { resolve } = require('path');

glob(resolve('src', '**', '*.d.ts'), (err, matches) => {
  if (err) console.log(err);

  matches.forEach(fileName => {
    unlink(fileName, err => {
      if (err) console.log('Could not remove', fileName);
    });
  });
});
