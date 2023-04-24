const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

class Util {
  static isEmpty(v) {
    return v === undefined || v === null || v === ''
  }
  
  /**
   * Returns current time with nice format.
   * @param {string} timezone
   * @param {string} [mode]
   */
  static getTime(timezone, mode) {
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
   * @param {string} eventName
   * @param {'subscribe'|'unsubscribe'} eventPurpose
   * @returns {Object}
   */
  static eventBuilder(eventName, eventPurpose = 'subscribe') {
    return {
      "header": {
        "requestId": uuidv4(),
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
   * @param {string} cmd
   * @param {import('../../typings/types').VersionResolvable} [commandVersion]
   * @returns {Object}
   */
   static commandBuilder(cmd, commandVersion = 1) {
    return {
      header: {
        requestId: uuidv4(),
        messagePurpose: "commandRequest",
        version: 1,
        messageType: "commandRequest"
      },
      body: {
        origin: {
          type: "player"
        },
        commandLine: cmd,
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

module.exports = Util;