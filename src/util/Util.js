const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc');

const moment = require('moment-timezone');
moment.tz.setDefault(getConfig().timezone);

function getConfig() {
  const file = fs.readFileSync(path.join(__dirname, '../../config.json'), { encoding: 'utf-8' });
  return jsonc.parse(file);
}

class Util {
  static isEmpty(v) {
    return v === undefined || v === null || v === ''
  }
  
  /**
   *
   * @param {string} [mode]
   * @param {string} [format]
   */
  static getTime(mode, format) {
    let now = moment();
    switch (mode) {
      case 'date':
        return now.format('MM/DD HH:mm:ss');
      case 'year':
        return now.format('YYYY MM/DD HH:mm:ss');
      case 'timestamp':
        return now.format();
      case 'custom':
        return now.format(format);
      default:
        return now.format('HH:mm:ss');
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
   * @param {string} [id]
   * @returns {Object}
   */
   static commandBuilder(cmd, id = uuidv4()) {
    return {
      header: {
        requestId: id,
        messagePurpose: "commandRequest",
        version: 1,
        messageType: "commandRequest"
      },
      body: {
        origin: {
          type: "player"
        },
        commandLine: cmd,
        version: 1
      }
    };
  }
  
  /**
   * splits string nicely (ignore ' and ")
   * @param {string} str
   * @returns {string}
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
  
  static getConfig() {
    return getConfig();
  }
  
  static commandString(str) {
    return str ? `"${str}"` : '';
  }
}

module.exports = Util;