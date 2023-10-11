import { LoggerOption, ServerOption } from '../types';
import { Util } from './Util';

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

export class Logger {
  public name: string;
  private options: LoggerOption | ServerOption;
  
  constructor(name: string, option: LoggerOption | ServerOption) {
    this.name = name;
    this.options = option;
    
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
    if (this.options.debug) console.log(`${color.blue}${this.getTime()}${color.magenta} Debug [${this.name}]`, ...args, color.reset);
  }
  
  getTime() {
    return Util.getTime(this.options.timezone);
  }
}
