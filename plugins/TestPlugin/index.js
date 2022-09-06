const { Plugin } = require('../../src');

const plugin = new Plugin({
  name: 'TestPlugin',
  version: [ 1, 0, 0 ],
  description: 'test',
  onEnable: (server) => {
    plugin.getLogger().log('Hello World!');
  }
});

module.exports = plugin;