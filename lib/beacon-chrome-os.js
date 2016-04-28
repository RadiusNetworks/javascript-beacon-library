(() => {
  'use strict';

  /**
  * @module beacon-chrome-os
  * @typicalname chromeOS
  */

  let BeaconAdvertisement = require('./beacon-advertisement.js').BeaconAdvertisement;
  let BeaconData = require('./beacon-data.js');

  /**
     This class wraps the underlying ChromeOS BLE Advertising API.
     @alias module:beacon-chrome-os
   */
  class BeaconChromeOS {

    static registerAdvertisement(options) {
      return new Promise((resolve, reject) => {
        let chromeAdv = BeaconChromeOS._constructAdvertisement(options);

        chrome.bluetoothLowEnergy.registerAdvertisement(chromeAdv, (advertisementId) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(new BeaconAdvertisement(advertisementId, options, BeaconChromeOS));
        });
      });
    }

    static unregisterAdvertisement(advertisement) {
      return new Promise((resolve, reject) => {
        chrome.bluetoothLowEnergy.unregisterAdvertisement(advertisement.id, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      });
    }

    static _constructAdvertisement(options) {
      let beaconType, data, advertisement;
      beaconType = options.beaconType;
      if (typeof beaconType === 'undefined') {
        throw new Error('No beacon type specified');
      }
      if ('manufacturerId' in beaconType) {
        data = BeaconData.constructBeaconData(beaconType, options.ids, options.advertisedTxPower);
        advertisement = {
          type: 'broadcast',
          manufacturerData: [{
            id: beaconType.manufacturerId,
            data: data
          }]
        };
      } else if ('serviceUuid' in beaconType) {
        // Convert serviceUuid to string
        let serviceUuid = beaconType.serviceUuid.toString(16).toUpperCase();
        data = BeaconData.constructBeaconData(beaconType, options.ids, options.advertisedTxPower);
        advertisement = {
          type: 'broadcast',
          serviceUuids: [serviceUuid],
          serviceData: [{
            uuid: serviceUuid,
            data: data
          }]
        };
      } else {
        throw new Error('No manufacturer ID or service UUID specified in beacon type');
      }

      return advertisement;
    }
  }

  module.exports = BeaconChromeOS;
})();
