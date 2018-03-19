/**
 * Wrap a block in a promise and provide a nodejs style function so that you can
 * call node functions with that function
 *
 * @example
 * toPromise(next => fs.readFile('foo.txt', next)
 * .then(data => console.log('The data:', data));
 *
 * @param {Function} callback A callback that will receive as it's argument a
 *                            'next' function that can be used to call nodejs
 *                            style functions.
 *
 * @return {Promise} A promise that will be resolved when the next function is
 *                   called
 */
function toPromise(callback) {
  return new Promise((resolve, reject) => {
    callback((error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

module.exports = toPromise;
