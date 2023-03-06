const Util = require('./Util');

const color = {
  black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',

  reset: '\u001b[0m',
}

class Logger {
  /** @param {string} name */
  constructor(name) {
    this.name = name;
    
    this.debug('Logger: Initialized');
  }
  
  log(...args) {
    console.log(`${color.blue}${Util.getTime()}${color.reset} Log [${this.name}]`, ...args);
  }
  
  info(...args) {
    console.log(`${color.blue}${Util.getTime()}${color.reset} ${color.cyan}Info${color.reset} [${this.name}]`, ...args);
  }
  
  warn(...args) {
    console.log(`${color.blue}${Util.getTime()}${color.yellow} Warn [${this.name}]`, ...args, color.reset);
  }
  
  error(...args) {
    console.log(`${color.blue}${Util.getTime()}${color.red} Error [${this.name}]`, ...args, color.reset);
  }
  
  debug(...args) {
    if (Util.getConfig().debug) console.log(`${color.blue}${Util.getTime()}${color.magenta} Debug [${this.name}]`, ...args, color.reset)
  }
}

module.exports = Logger;