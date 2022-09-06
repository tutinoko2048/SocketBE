const fs = require('fs');
const { Logger } = require('../');

class PluginManager {
  constructor(server) {
    this.server = server;
    this.logger = new Logger('PluginManager');
    this.plugins = [];
    this.loadPlugins();
  }
  
  getPluginPath() {
    return fs.readdirSync('./plugins', { withFileTypes: true })
      .filter(f => f.isDirectory())
      .map(p => p.name);
  }
  
  loadPlugins() {
    this.getPluginPath()
      .forEach(path => {
        try {
          const plugin = require(`../../plugins/${path}`);
          this.getLogger().info(`Loading ${plugin.name}@${plugin.version}`);
          this.plugins.push(plugin);
        } catch(e) {
          this.getLogger().error(e);
        }
      });
  }
  
  enablePlugins() {
    this.plugins.forEach(p => this.enablePlugin(p));
  }
  
  enablePlugin(plugin) {
    this.getLogger().info(`Enabling ${plugin.name}@${plugin.version}`);
    plugin.onEnable(this.server);
  }
  
  getLogger() {
    return this.logger;
  }
}

module.exports = PluginManager;