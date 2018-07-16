const prettier = require('prettier');
const loaderUtils = require('loader-utils');
const fs = require('fs');

const parsers = {
  tsx: 'typescript',
  ts: 'typescript',
  less: 'less',
};

module.exports = async function(source, map) {
  const callback = this.async();

  try {
    const extension = (/(\w+)$/.exec(this.resourcePath) || {})[1];
    const parser = parsers[extension];
    const config = await prettier.resolveConfig(this.resourcePath);
    const options = Object.assign(
      {},
      config,
      loaderUtils.getOptions(this),
      { parser }
    );
    this.cacheable();

    // TODO: prettier.check(source) here?
    const prettierSource = prettier.format(source, options);

    if (prettierSource !== source) {
      try {
        fs.writeFileSync(this.resourcePath, prettierSource);
      }
      catch (error) {
        return callback(error);
      }
    }

    return callback(null, prettierSource, map);
  }
  catch (error) {
    return callback(error);
  }
};
