const { spawnSync } = require('child_process');

const exec = (program, ...args) => {
  let result = '';
  console.log('Executing', program, args);

  try {
    const {
      error, stdout, output, status
    } = spawnSync(program, args);

    if (error) console.log(error);

    console.log(stdout.toString());

    result = {
      code: status,
      stdout,
      output,
    };
  }

  catch (err) {
    console.log(err.stack || err.message);
    console.log('Could not execute', program, args);
    result = {
      code: 1
    };
  }

  return result;
};

/**
 * Executes a shell command
 *
 * @param {string[]} rest The template expressions
 *
 * @return {string} stdout value
 */
const sh = (...rest) => {
  const shargs = rest;
  console.log('Shargs', shargs);
  return exec(shargs[0], ...shargs.slice(1));
};

module.exports = {
  exec,
  sh
};
