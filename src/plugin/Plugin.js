const { Util, Logger } = require('../');

class Plugin {
  constructor(option) {
    const { name, version, description, onEnable } = option;
    this.name = name;
    this.version = Array.isArray(version) ? version.join('.') : version;
    this.description = description;
    this.onEnable = onEnable;
    this.logger = new Logger(this.name);
  }
  
  getLogger() {
    return this.logger;
  }
}

module.exports = Plugin;