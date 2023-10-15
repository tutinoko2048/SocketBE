import { randomUUID } from 'node:crypto';
import { ServerPacket, VersionResolvable } from '../types';
import * as moment from 'moment-timezone'

type EventPurpose = 'subscribe' | 'unsubscribe';

export class Util {
  static isEmpty(v) {
    return v === undefined || v === null || v === ''
  }
  
  /**
   * Returns current time with nice format.
   */
  static getTime(timezone: string, mode?: string) {
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
  static eventBuilder(eventName: string, eventPurpose: EventPurpose = 'subscribe'): any {
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
   static commandBuilder(command: string, commandVersion: VersionResolvable = 1): ServerPacket {
    return {
      header: {
        requestId: randomUUID(),
        messagePurpose: "commandRequest",
        version: 1,
        messageType: "commandRequest"
      },
      body: {
        origin: {
          type: "player"
        },
        commandLine: command,
        version: commandVersion
      }
    };
  }
  
  /**
   * splits string nicely (ignore ' and ")
   * @param {string} str
   * @returns {string[]}
   */
  static splitNicely(str) {
    let split = str.split(/(?<!['"]\w+) +(?!\w+['"])/);
    return split.map(x => x.replace(/^"(.*)"$/g, '$1'));
  }
  
  /**
   * 
   * @param {number[]} numbers
   * @returns {number}
   */
  static median(numbers) {
    const half = (numbers.length / 2) | 0;
    const arr = numbers.slice().sort((a,b) =>  a - b);
    return (arr.length % 2 ? arr[half] : (arr[half-1] + arr[half]) / 2) || 0;
  }
  
  /**
   * 
   * @param {number[]} numbers
   * @returns {number}
   */
  static average(numbers) {
    return (numbers.reduce((a,b) => a + b, 0) / numbers.length) || 0;
  }
  
  static commandString(str) {
    return str ? `"${str}"` : '';
  }
  
  static sleep(ms) {
   return new Promise(res => setTimeout(res, ms));
 }
}
