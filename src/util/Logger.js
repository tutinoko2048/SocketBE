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

/** @typedef {import('../../typings/types').LoggerOption} LoggerOption */
/** @typedef {import('../../typings/types').ServerOption} ServerOption */

class Logger {
  /**
   * @param {string} name
   * @param {LoggerOption|ServerOption} option
   */
  constructor(name, option) {
    this.name = name;
    this.option = option;
    
    this.debug('Logger: Initialized');
  }
  
  log(...args) {
    console.log(`${color.blue}${this.getTime()}${color.reset} Log [${this.name}]`, ...args);
  }
  
  info(...args) {
    console.log(`${color.blue}${this.getTime()} ${color.cyan}Info${color.reset} [${this.name}]`, ...args);
  }
  
  warn(...args) {
    console.log(`${color.blue}${this.getTime()} ${color.yellow}Warn${color.reset} [${this.name}]`, ...args, color.reset);
  }
  
  error(...args) {
    console.log(`${color.blue}${this.getTime()} ${color.red}Error${color.reset} [${this.name}]`, ...args, color.reset);
  }
  
  debug(...args) {
    if (this.option.debug) console.log(`${color.blue}${this.getTime()}${color.magenta} Debug [${this.name}]`, ...args, color.reset);
  }
  
  getTime() {
    return Util.getTime(this.option.timezone);
  }
}

module.exports = Logger;