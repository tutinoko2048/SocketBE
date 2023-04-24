export = Util;
declare class Util {
    static isEmpty(v: any): boolean;
    static getTime(timezone: string, mode?: string): string;
    static eventBuilder(eventName: string, eventPurpose?: 'subscribe' | 'unsubscribe'): any;
    static commandBuilder(cmd: string, commandVersion?: import('../types').VersionResolvable): any;
    static splitNicely(str: string): string;
    static median(numbers: number[]): number;
    static average(numbers: number[]): number;
    static commandString(str: any): string;
    static sleep(ms: any): Promise<any>;
}
