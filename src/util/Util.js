const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');

class Util {
  static isEmpty(v) {
    return v === undefined || v === null || v === ''
  }
  
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
   * @param {'subscribe'|'unsubscribe'} eventPurpose
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
  
  static splitNicely(str) {
    let split = str.split(/(?<!['"]\w+) +(?!\w+['"])/);
    return split.map(x => x.replace(/^"(.*)"$/g, '$1'));
  }
  
  static median(numbers) {
    const half = (numbers.length / 2) | 0;
    const arr = numbers.slice().sort((a,b) =>  a - b);
    return (arr.length % 2 ? arr[half] : (arr[half-1] + arr[half]) / 2) || 0;
  }
  
  static average(numbers) {
    return (numbers.reduce((a,b) => a + b, 0) / numbers.length) || 0;
  }
}

module.exports = Util;
