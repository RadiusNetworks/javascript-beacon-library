'use strict';

let BeaconAdvertisement = require('./beacon-advertisement.js').BeaconAdvertisement;

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
    let advertisement;

    data = Beacon.constructManufacturerData(options.id1, etc, options.advertisedTxPower);
    advertisement = {
      type: 'broadcast',
      manufacturerData: [{
        id: IBEACON_ID,
        data: data
      }]
    };
    return advertisement;
  }
}

export default BeaconChromeOS;
