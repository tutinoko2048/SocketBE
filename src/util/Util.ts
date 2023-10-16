import { randomUUID } from 'node:crypto';
import { CommandRequestPacket, PacketPurpose, ServerPacket, VersionResolvable } from '../types';
import * as moment from 'moment-timezone'

export class Util {  
  /**
   * Returns current time with nice format.
   */
  static getTime(timezone: string, mode?: 'date' | 'year' | 'timestamp'): string {
    const now = moment().tz(timezone);
    switch (mode) {
      case 'date':
        return now.format('MM/DD HH:mm:ss');
      case 'year':
        return now.format('YYYY MM/DD HH:mm:ss');
      case 'timestamp':
        return now.format();
      case undefined:
        return now.format('HH:mm:ss');
      default:
        return now.format(mode);
    }
  }
  
  /**
   * Creates event packet
   */
  static eventBuilder(eventName: string, eventPurpose: PacketPurpose = 'subscribe'): ServerPacket {
    return {
      "header": {
        "requestId": randomUUID(),
        "messagePurpose": eventPurpose,
        "version": 1,
        "messageType": "commandRequest"
      },
      "body": {
        "eventName": eventName
      }
    };
  }
  
  /**
   * Creates command packet
   */
   static commandBuilder(command: string, commandVersion: VersionResolvable = 1): CommandRequestPacket {
    return {
      header: {
        requestId: randomUUID(),
        messagePurpose: "commandRequest",
        version: 1,
        messageType: "commandRequest"
      },
      body: {
        commandLine: command,
        version: commandVersion
      }
    };
  }
  
  /**
   * splits string nicely (ignore ' and ")
   */
  static splitNicely(str: string): string[] {
    let split = str.split(/(?<!['"]\w+) +(?!\w+['"])/);
    return split.map(x => x.replace(/^"(.*)"$/g, '$1'));
  }
  
  static median(numbers: number[]): number {
    const half = (numbers.length / 2) | 0;
    const arr = numbers.slice().sort((a,b) =>  a - b);
    return (arr.length % 2 ? arr[half] : (arr[half-1] + arr[half]) / 2) || 0;
  }
  
  static average(numbers: number[]): number {
    return (numbers.reduce((a,b) => a + b, 0) / numbers.length) || 0;
  }
    
  static sleep(ms: number): Promise<void> {
   return new Promise(res => setTimeout(res, ms));
 }
}
