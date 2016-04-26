(() => {
  'use strict';

  /**
  * @module beacon
  * @typicalname beacon
  */

  let platform = require('./platform.js');

  class Beacon {
    constructor() {
      this._platform = platform();
      this.advertisements = [];
      this.beaconTypes = {};
      this.registerDefaultBeaconTypes();
    }

    registerAdvertisement(options) {
      let self = this;
      return new Promise((resolve, reject) => {
        if (!self._platform) {
          reject(new Error('Platform not supported.'));
          return;
        }
        options.beaconType = self.beaconTypes[options.type];
        Beacon._checkAdvertisementOptions(options);
        return self._platform.registerAdvertisement(options).then(advertisement => {
          self.advertisements.push(advertisement);
          resolve(advertisement);
        }, reject);
      });
    }

    registerBeaconType(options) {
      let self = this;
      // Register a new custom beacon type
      if (!('parserLayout' in options) && !('type' in options)) {
        throw new TypeError('Required member type or parserLayout is undefined.');
      }
      if (!('manufacturerId' in options) && !('serviceUuid' in options)) {
        throw new TypeError('Required member manufacturerId or serviceUuid is undefined.');
      }
      if (('manufacturerId' in options) && ('serviceUuid' in options)) {
        throw new TypeError('manufacturerId and serviceUuid can\'t both be defined for an advertisement.');
      }

      let type = options.type;
      let parserLayout = options.parserLayout;

      if ('manufacturerId' in options) {
        let manufacturerId = options.manufacturerId;
        self.beaconTypes[type] = {
          parserLayout: parserLayout,
          manufacturerId: manufacturerId
        };
      } else if ('serviceUuid' in options) {
        let serviceUuid = options.serviceUuid;
        self.beaconTypes[type] = {
          parserLayout: parserLayout,
          serviceUuid: serviceUuid
        };
      }
    }

    registerDefaultBeaconTypes() {
      let defaultBeaconTypes;
      defaultBeaconTypes = [
        {
          type: 'altbeacon',
          parserLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
          manufacturerId: 0x0118
        },
        {
          type: 'eddystone_uid',
          parserLayout: 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19,d:20-21',
          serviceUuid: 0xFEAA
        },
        {
          type: 'eddystone_url',
          parserLayout: 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v',
          serviceUuid: 0xFEAA
        }
      ];
      for (let i = 0; i < defaultBeaconTypes.length; i++) {
        let beaconType = defaultBeaconTypes[i];
        this.registerBeaconType(beaconType);
      }
    }

    static _checkAdvertisementOptions(options) {
      if (!('type' in options)) {
        throw new TypeError('Required member type is undefined.');
      }
      if (!('beaconType' in options)) {
        throw new TypeError('Specified type not listed in beacon types');
      }
      if (typeof options.type !== 'undefined') {
        Beacon._checkTypeOptions(options);
      }
      if (options.type === 'altbeacon') {
        Beacon._checkAltbeaconOptions(options);
      } else if (options.type === 'eddystone_uid') {
        Beacon._checkUidOptions(options);
      } else if (options.type === 'eddystone_url') {
        Beacon._checkUrlOptions(options);
      }
    }

    static _checkAltbeaconOptions(options) {
      if (options.ids.length !== 3) {
        throw new TypeError('Wrong number of ids for type AltBeacon.');
      }
    }
    static _checkUidOptions(options) {
      if (options.ids.length !== 2) {
        throw new TypeError('Wrong number of ids for type Eddystone UID.');
      }
    }
    static _checkUrlOptions(options) {
      if (options.ids.length !== 1) {
        throw new TypeError('Wrong number of ids for type Eddystone URL.');
      }
    }
    static _checkTypeOptions(options) {
      if (!('manufacturerId' in options.beaconType) && !('serviceUuid' in options.beaconType)) {
        throw new TypeError('Required member manufacturerId or serviceUuid is undefined.');
      }
      if (!('parserLayout' in options.beaconType)) {
        throw new TypeError('Parser layout not defined in beacon type.');
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
