export = Logger;
declare class Logger {
    constructor(server: import('../Server'), name: string);
    name: string;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
    getTime(): string;
    #private;
}
