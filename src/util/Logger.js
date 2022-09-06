const { Util } = require('../');

class Logger {
  constructor(name) {
    this.name = name;
  }
  
  log(...args) {
    console.log(`${Util.getTime()} [Log] [${this.name}]`, ...args);
  }
  
  info(...args) {
    console.log(`${Util.getTime()} [Info] [${this.name}]`, ...args);
  }
  
  warn(...args) {
    console.log(`${Util.getTime()} [Warn] [${this.name}]`, ...args);
  }
  
  error(...args) {
    console.log(`${Util.getTime()} [Error] [${this.name}]`, ...args);
  }
  
}

module.exports = Logger;