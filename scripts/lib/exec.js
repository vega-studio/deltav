const { spawnSync } = require('child_process');

const exec = (program, ...args) => {
  let result = '';

  const {
    error, output, status
  } = spawnSync(program, args);

  if (error)

  result = output.join('\n');
  result.code = status;

  return result;
};

/**
 * Executes a shell command
 *
 * @param {string[]} strings All the input from the template string split by the
 *                           template expressions
 * @param {string[]} rest The template expressions
 *
 * @return {string} stdout value
 */
const sh = (strings, ...rest) => {
  const shargs = strings.reduce((result, item, i) => {
    return result.concat(item.trim()).concat(rest[i]);
  }, []).filter(Boolean);
  return exec(shargs);
};

module.exports = {
  exec,
  sh
};
