(() => {
  'use strict';

  let BeaconAdvertisement = require('./beacon-advertisement.js').BeaconAdvertisement;
  let BeaconType = require('./beacon-advertisement.js').BeaconType;

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
      let data;
      let mfr_id;
      let service_uuid;
      let advertisement;

      if (typeof options.manufacturerId !== 'undefined') {
        data = BeaconData.constructManufacturerData(options.type, options.parserLayout, options.ids, options.advertisedTxPower);
        mfr_id = BeaconData.constructManufacturerId(options.manufacturerId);
        advertisement = {
          type: 'broadcast',
          manufacturerData: [{
            id: mfr_id,
            data: data
          }]
        };
      } else if (typeof options.serviceUuid !== 'undefined') {
        data = BeaconData.constructServiceData(options.type, options.parserLayout, options.ids, options.advertisedTxPower);
        service_uuid = BeaconData.constructServiceUuid(options.serviceUuid);
        advertisement = {
          type: 'broadcast',
          serviceUuids: [service_uuid],
          serviceData: [{
            uuid: service_uuid,
            data: data
          }]
        };
      } else {
        throw new Error('No manufacturer ID or service UUID specified');
      }

      return advertisement;
    }
  }

  module.exports = BeaconChromeOS;
})();
