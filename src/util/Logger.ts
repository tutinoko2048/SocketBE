import { ServerOptions } from '../types';
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

export interface LoggerOptions {
  debug?: boolean;
  timezone?: string;

  /** Whether the server emits logs. Defaults to true. */
  emitLogs?: boolean;
}

const defaultOptions: LoggerOptions = {
  debug: false,
  emitLogs: true
}

export class Logger {
  public name: string;
  public options: LoggerOptions | ServerOptions;
  
  constructor(name: string, options?: LoggerOptions | ServerOptions) {
    this.name = name;
    this.options = { ...defaultOptions, ...options }
    
    this.debug('Logger: Initialized');
  }
  
  public log(...args): void {
    if (this.options.emitLogs)
      console.log(`${color.blue}${this.getTime()} ${color.reset}Log [${this.name}]`, ...args);
  }
  
  public info(...args) {
    if (this.options.emitLogs)
      console.log(`${color.blue}${this.getTime()} ${color.cyan}Info${color.reset} [${this.name}]`, ...args);
  }
  
  public warn(...args) {
    if (this.options.emitLogs)
      console.log(`${color.blue}${this.getTime()} ${color.yellow}Warn${color.reset} [${this.name}]`, ...args, color.reset);
  }
  
  public error(...args) {
    if (this.options.emitLogs)
      console.log(`${color.blue}${this.getTime()} ${color.red}Error${color.reset} [${this.name}]`, ...args, color.reset);
  }
  
  public debug(...args) {
    if (this.options.debug && this.options.emitLogs)
      console.log(`${color.blue}${this.getTime()}${color.magenta} Debug [${this.name}]`, ...args, color.reset);
  }
  
  private getTime() {
    return Util.getTime(this.options.timezone);
  }
}
