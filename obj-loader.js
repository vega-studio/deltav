module.exports = function(content) {
  if (this.cacheable) this.cacheable();
  this.value = content;
  return 'module.exports = ' + JSON.stringify(content);
};
