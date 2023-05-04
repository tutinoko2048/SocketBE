import { LoggerOption, ServerOption } from "../types";

export = Logger;
declare class Logger {
    constructor(name: string, option: LoggerOption | ServerOption);
    name: string;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
    getTime(): string;
    #private;
}
