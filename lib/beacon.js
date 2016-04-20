(() => {
  'use strict';

  /**
  * @module beacon
  * @typicalname beacon
  */

  let platform = require('./platform.js');
  let BeaconType = require('./beacon-advertisement.js').BeaconType;


  class Beacon {
    constructor() {
      this._platform = platform();
      this.advertisements = [];
    }

    registerAdvertisement(options) {
      let self = this;
      return new Promise((resolve, reject) => {
        if (!self._platform) {
          reject(new Error('Platform not supported.'));
          return;
        }
        Beacon._checkAdvertisementOptions(options);
        return self._platform.registerAdvertisement(options).then(advertisement => {
          self.advertisements.push(advertisement);
          resolve(advertisement);
        }, reject);
      });
    }

    static _checkAdvertisementOptions(options) {
      if (!('type' in options) && !('parserLayout' in options)) {
        throw new TypeError('Required member type or parserLayout is undefined.');
      }
      if (typeof options.type === 'undefined') {
        Beacon._checkCustomOptions(options);
      } else if (options.type === BeaconType.ALTBEACON) {
        Beacon._checkAltbeaconOptions(options);
      } else if (options.type === BeaconType.EDDYSTONE_UID) {
        Beacon._checkUidOptions(options);
      } else if (options.type === BeaconType.EDDYSTONE_URL) {
        Beacon._checkUrlOptions(options);
      } else {
        throw new TypeError('Unsupported Frame Type: ' + options.type);
      }
    }

    static _checkCustomOptions(options) {
      if (!('manufacturerId' in options) && !('serviceUuid' in options)) {
        throw new TypeError('Required member manufacturerId or serviceUuid is undefined.');
      }
      if (!('parserLayout' in options)) {
        throw new TypeError('Required member parserLayout is undefined.');
      }
      if (!('ids' in options)) {
        throw new TypeError('Required member ids is undefined.');
      }
      if (!('advertisedTxPower' in options)) {
        throw new TypeError('Required member advertisedTxPower is undefined.');
      }
    }
    static _checkAltbeaconOptions(options) {
      Beacon._checkTypeOptions(options);
      if (options.ids.length !== 3) {
        throw new TypeError('Wrong number of ids for type AltBeacon.');
      }
    }
    static _checkUidOptions(options) {
      Beacon._checkTypeOptions(options);
      if (options.ids.length !== 2) {
        throw new TypeError('Wrong number of ids for type Eddystone UID.');
      }
    }
    static _checkUrlOptions(options) {
      Beacon._checkTypeOptions(options);
      if (options.ids.length !== 1) {
        throw new TypeError('Wrong number of ids for type Eddystone URL.');
      }
    }
    static _checkTypeOptions(options) {
      if (('manufacturerId' in options) || ('serviceUuid' in options)) {
        throw new TypeError('Unnecessary member manufacturerId or serviceUuid is defined.');
      }
      if (('parserLayout' in options)) {
        throw new TypeError('Unnecessary member parserLayout is defined.');
      }
      if (!('ids' in options)) {
        throw new TypeError('Required member ids is undefined.');
      }
      if (!('advertisedTxPower' in options)) {
        throw new TypeError('Required member advertisedTxPower is undefined.');
      }
    }
  }

  module.exports = Beacon;
})();
