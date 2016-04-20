(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(() => {
  'use strict';

  const BeaconType = {
    ALTBEACON: 'altbeacon',
    EDDYSTONE_UID: 'eddystone_uid',
    EDDYSTONE_URL: 'eddystone_url'
  };

  class BeaconAdvertisement {

    constructor(id, options, platform) {
      if (typeof platform === 'undefined') {
        throw new TypeError('Required member platform is undefined');
      }
      /**
        The platform that this advertisement will be broadcast on.
      */
      this._platform = platform;

      /**
        The ID of this advertisment.
      */
      this.id = undefined;
      
      this.type = undefined;

      /**
        The calibrated measured Tx power of the Beacon in RSSI.
        This value is baked into an Beacon when it is manufactured, and
        it is transmitted with each packet to aid in the mDistance estimate
      */
      this.advertisedTxPower = undefined;

      /**
        A list of the multi-part identifiers of the beacon.  Together, these identifiers signify
        a unique beacon.  The identifiers are ordered by significance for the purpose of grouping
        beacons
      */
      this.ids = undefined;

      /**
        A list of generic non-identifying data fields included in the beacon advertisement.
      */
      this.dataFields = undefined;

      /**
        A list of generic non-identifying data fields included in a secondary beacon advertisement
        and merged into this beacon.
      */
      this.extraDataFields = undefined;

      /**
        The two byte value indicating the type of beacon that this is, which is used for figuring
        out the byte layout of the beacon advertisement
      */
      this.beaconTypeCode = undefined;

      /**
        A two byte code indicating the beacon manufacturer.  A list of registered manufacturer codes
        may be found here:
        https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers

        If the beacon is a GATT-based beacon, this field will be set to -1
      */
      this.manufacturerId = undefined;

      /**
        A 32 bit service uuid for the beacon
        This is valid only for GATT-based beacons.   If the beacon is a manufacturer data-based
        beacon, this field will be -1
      */
      this.serviceUuid = undefined;

      /**
        A string containing the layout of the custom beacon advertisement layout.
        Follows the same convention as the Android Beacon Library
      */
      this.parserLayout = undefined;

      if (typeof options.manufacturerId !== 'undefined' && typeof options.serviceUuid !== 'undefined') {
        throw new Error('Manufacturer ID and Service UUID can\'t both be specified');
      }
      if (typeof options.type !== 'undefined') {
        this.type = options.type;
      } else {
        if (typeof options.parserLayout !== 'undefined') {
          this.parserLayout = options.parserLayout;
        } else {
          throw new Error('Parser layout must be specified if beacon type is not');
        }
      }
      if (typeof options.manufacturerId !== 'undefined') {
        // Manufacturer advertisement
        this.id = id;
        this.ids = options.ids;
        this.advertisedTxPower = options.advertisedTxPower;
        this.manufacturerId = options.manufacturerId;
      } else if (typeof options.serviceUuid !== 'undefined')  {
        // Service advertisement
        this.id = id;
        this.ids = options.ids;
        this.advertisedTxPower = options.advertisedTxPower;
        this.serviceUuid = options.serviceUuid;
      } else {
        throw new Error('NO manufacturer ID or service UUID specified');
      }
    }

    /**
      Unregisters the current advertisement.
      @fulfill {void} - If the advertisement was unregistered successfully.
      @reject {Error} - If the advertisement failed to be registered. If
      the promise rejects the advertisment may still be broadcasting. The only
      way to recover may be to reboot your machine.
      @returns {Promise.<void>}
    */
    unregisterAdvertisement() {
      return this._platform.unregisterAdvertisement(this);
    }
  }

  exports.BeaconAdvertisement = BeaconAdvertisement;
  exports.BeaconType = BeaconType;
})();

},{}],2:[function(require,module,exports){
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

},{"./beacon-advertisement.js":1}],3:[function(require,module,exports){
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

},{"./beacon-advertisement.js":1,"./platform.js":5}],4:[function(require,module,exports){
(function (global){
(() => {
  'use strict';

  // Only require top level module. Browserify will walk
  // the dependency graph and load all needed modules.
  let Beacon = require('./beacon.js');

  /**
   * The global beacon instance.
   *
   * @global
   * @type module:javascript-beacon-library
   */
   global.beacon = new Beacon();
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./beacon.js":3}],5:[function(require,module,exports){
(() => {
  'use strict';

  /**
  * @module platform
  */

  let BeaconChromeOS = require('./beacon-chrome-os.js');
  /**
  Detects what API is available in the platform.
  @returns {Object} An object that wraps the underlying BLE
  Advertising API
  @throws {Error} If the platform is unsupported
  @alias module:platform
  */
  function platform() {
    if (typeof chrome !== 'undefined') {
      return BeaconChromeOS;
    } else if (typeof _beacon_test !== 'undefined') {
      return {};
    } else {
      throw new Error('Unsupported platform.');
    }
  }

  module.exports = platform;
})();

},{"./beacon-chrome-os.js":2}]},{},[4]);
