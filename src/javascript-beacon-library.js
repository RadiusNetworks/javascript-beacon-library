'use strict';

let platform = require('./platform.js');

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
    if (!('type' in options)) {
      throw new TypeError('Required member type is undefined.');
    }
  }
}

export default Beacon;

// // AltBeacon
// beacon.registerAdvertisement({
//   type: 'altbeacon',
//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
//   advertisedTxPower: -59,
//   manufacturerId: 0x0118
// })
//
// // iBeacon
// beacon.registerAdvertisement({
//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
//   advertisedTxPower: -59,
//   manufacturer: 0x004c,
//   parserLayout: ':2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24'
// })
//
// // Eddystone UID
// beacon.registerAdvertisement({
//   type: 'eddystone_uid',
//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
//   advertisedTxPower: -20,
//   serviceUuid: 0xFEAA
// })
//
// // Eddystone URL
// beacon.registerAdvertisement({
//   type: 'eddystone_url',
//   ids: ['http://radiusnetworks.com'],
//   advertisedTxPower: -20,
//   serviceUuid: 0xFEAA
// })
