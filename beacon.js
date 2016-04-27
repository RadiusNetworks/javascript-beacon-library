(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(() => {
  'use strict';

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
      this.beaconType = undefined;

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
      this.beaconLayout = undefined;

      if (typeof options.beaconType.manufacturerId !== 'undefined' && typeof options.beaconType.serviceUuid !== 'undefined') {
        throw new Error('Manufacturer ID and Service UUID can\'t both be specified');
      }
      if (typeof options.type !== 'undefined') {
        this.type = options.type;
        this.beaconType = options.beaconType;
      } else {
        throw new Error('Beacon type must be specified');
      }
      if (typeof options.beaconType.manufacturerId !== 'undefined') {
        // Manufacturer advertisement
        this.id = id;
        this.ids = options.ids;
        this.dataFields = options.dataFields;
        this.advertisedTxPower = options.advertisedTxPower;
        this.manufacturerId = options.beaconType.manufacturerId;
      } else if (typeof options.beaconType.serviceUuid !== 'undefined')  {
        // Service advertisement
        this.id = id;
        this.ids = options.ids;
        this.dataFields = options.dataFields;
        this.advertisedTxPower = options.advertisedTxPower;
        this.serviceUuid = options.beaconType.serviceUuid;
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
})();

},{}],2:[function(require,module,exports){
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

},{"./beacon-advertisement.js":1,"./beacon-data.js":3}],3:[function(require,module,exports){
(function (global){
(() => {
  'use strict';

  /**
   * @module beacon-data
   * @typicalname data
   */

  /**
     BeaconData.
     @private
     @constant {number}
     @default
   */

  let BeaconParser = require('./beacon-layout.js');

  // If we are in a browser TextEncoder should be available already.
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('text-encoding').TextEncoder;
  }

  const HEX_REGEX = /[0-9a-f]/i;
  const URL_SCHEMES = [
    'http://www.',
    'https://www.',
    'http://',
    'https://'
  ];
  const URL_CODES = [
    '.com/',
    '.org/',
    '.edu/',
    '.net/',
    '.info/',
    '.biz/',
    '.gov/',
    '.com',
    '.org',
    '.edu',
    '.net',
    '.info',
    '.biz',
    '.gov'
  ];

  // The Eddystone-URL spec says to use 'us-ascii' encoding but not all
  // browsers support it, so we use 'utf-8' which is a super set of
  // 'us-ascii' and wildly supported. We later check the encoded characters
  // are in the range allowed by the Eddystone-URL Spec.
  // https://github.com/google/eddystone/tree/master/eddystone-url#eddystone-url-http-url-encoding
  let encoder = new TextEncoder('utf-8');


  /**
     This class provides helper functions that relate to constructing beacon data.
     @alias module:beacon-data
   */
  class BeaconData {

    /**
       Constructs valid beacon manufacturer or service data for different beacon types
     */
    static constructBeaconData(beacon_type, ids, advertisedTxPower, dataFields) {
      if (advertisedTxPower < -100 || advertisedTxPower > 20) {
        throw new Error('Invalid Tx Power value: ' + advertisedTxPower + '.');
      }
      let layout = BeaconParser.parseLayout(beacon_type.beaconLayout);
      let end_bytes = [].concat(layout.matchers, layout.ids, layout.power, layout.dataFields).map((e) => e.end);
      let length = Math.max.apply(Math, end_bytes) + 1;
      // Start with array of zeros
      let base_frame = Array.apply(null, Array(length)).map(Number.prototype.valueOf,0);
      // Insert matchers into base frame array
      let layout_matchers = layout.matchers;
      layout_matchers.forEach((matcher) => {
        let bytes = BeaconData.getByteArray(matcher.expected, matcher.length);
        let args = [matcher.start, matcher.length].concat(bytes);
        Array.prototype.splice.apply(base_frame, args);
      });
      // Insert IDs into base frame array
      let layout_ids = layout.ids;
      layout_ids.forEach((layout_id, index) => {
        let id = ids[index];
        let bytes;
        if (beacon_type.beaconLayout === 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v') {
          // Detect Eddystone URL and encode URL
          bytes = BeaconData.encodeURL(id);
        } else {
          bytes = BeaconData.getByteArray(id, layout_id.length);
        }
        let args = [layout_id.start, layout_id.length].concat(bytes);
        Array.prototype.splice.apply(base_frame, args);
      });
      // Insert data fields into base frame array
      if ('data_fields' in layout) {
        let data_fields = layout.data_fields;
        data_fields.forEach((layout_data_field, index) => {
          if (typeof dataFields !== 'undefined') {
            let dataField = dataFields[index];
            let bytes = BeaconData.getByteArray(dataField, layout_data_field.length);
            let args = [layout_data_field.start, layout_data_field.length].concat(bytes);
            Array.prototype.splice.apply(base_frame, args);
          }
        });
      }
      // Insert power into base frame array
      let layout_power = layout.power;
      if ('manufacturerId' in beacon_type) {
        // power represented as signed hex for manufacturer advertisements
        advertisedTxPower += 256;
      }
      base_frame.splice(layout_power.start, layout_power.length, advertisedTxPower);
      // Strip off service uuid/manufacturer id from beginning data
      // These two bytes are a part of the beacon parser layout convention but
      // aren't needed in the data for the Chrome OS BLE API, they're entered separately
      base_frame.splice(0, 2);
      return base_frame;
    }

    /**
       Validates the give array of bytes or converts the hex string into an array of bytes.
       @param {number[]|string} value The value to encode.
       @throws {TypeError} If |value| is not an array or a string.
       @throws {Error} If |value| contains out-of-range numbers or characters.
       @returns {number[]} Array of bytes.
    */
    static getByteArray(value, expected_length) {
      if (typeof value === 'string') {
        // A hex string is twice as long as the byte array it represents.
        let str_expected_length = expected_length * 2;
        return BeaconData._encodeString(value, str_expected_length);
      }
      if (typeof value === 'number') {
        return BeaconData._encodeNumber(value, expected_length);
      }
      if (Array.isArray(value)) {
        return BeaconData._validateByteArray(value, expected_length);
      }
      throw new TypeError('Only string or array are supported');
    }

    static getHexString(bytes) {
      let hex_string = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] > 0xFF) {
          throw new Error('Invalid value \'' + bytes[i] + '\' at index ' + i + '.');
        }
        hex_string = hex_string.concat((bytes[i] >>> 4).toString(16));
        hex_string = hex_string.concat((bytes[i] & 0xF).toString(16));
      }
      return hex_string;
    }

    static _encodeString(str, expected_length) {
      if (expected_length % 2 !== 0) {
        throw new Error('expected_length should be an even number.');
      }
      if (str.length !== expected_length) {
        throw new Error('Expected length to be: ' + expected_length + '. ' +
                        'But was: ' + str.length  + '. Remember a hex string is twice ' +
                        'as long as the number of bytes desired.');
      }
      let bytes = [];
      for (let i = 0; i < str.length; i += 2) {
        if (!HEX_REGEX.test(str[i])) {
          throw new Error('Invalid character \'' + str[i] + '\' at index ' + i);
        }
        if (!HEX_REGEX.test(str[i + 1])) {
          throw new Error('Invalid character \'' + str[i + 1] + '\' at index ' + (i + 1));
        }
        bytes.push(parseInt(str.substr(i, 2), 16));
      }
      return bytes;
    }

    static _encodeNumber(num, expected_length) {
      if (typeof num !== 'number') {
        throw new Error('Input not a number: ' + num);
      }
      if (num < 0 || num > 65535) {
        throw new Error('two byte hex number must be between 0 and 65535.');
      }
      let str;
      // Convert number to string and pad with zeros
      str = ('0000' + num.toString(16)).substr(-(4));
      // A hex string is twice as long as the byte array it represents.
      let str_expected_length = expected_length * 2;
      return BeaconData._encodeString(str, str_expected_length);
    }

    static _validateByteArray(arr, expected_length) {
      if (arr.length !== expected_length) {
        throw new Error('Expected length to be: ' + expected_length + '. ' +
                        'But was: ' + arr.length + '.');
      }
      for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== 'number') {
          throw new Error('Unexpected value \'' + arr[i] + '\' at index ' + i + '.');
        }
        if (!(arr[i] >= 0x00 && arr[i] <= 0xFF)) {
          throw new Error('Unexpected value \'' + arr[i] + '\' at index ' + i + '.');
        }
      }
      return arr;
    }


    static encodeURL(url) {
      let encoded_url = [];

      let scheme = BeaconData._encodeURLScheme(url);
      encoded_url.push(scheme.encoded);

      let position = scheme.length;

      while (position < url.length) {
        let encoded_fragment = BeaconData._encodeURLFragment(url, position);
        encoded_url.push(encoded_fragment.encoded);
        position += encoded_fragment.realLength;
      }
      return encoded_url;
    }

    static _encodeURLScheme(url) {
      for (let i = 0 ; i < URL_SCHEMES.length; i++) {
        if (url.startsWith(URL_SCHEMES[i])) {
          return {
            encoded: i,
            length: URL_SCHEMES[i].length
          };
        }
      }
      throw new Error('URL Scheme not supported.');
    }

    static _encodeURLFragment(url, starting_position) {
      for (let i = 0; i < URL_CODES.length; i++) {
        // FIXME: Use a faster encoding algorithm e.g. a trie.
        if (url.startsWith(URL_CODES[i], starting_position)) {
          return {
            encoded: i,
            realLength: URL_CODES[i].length
          };
        }
      }
      let encoded_character = encoder.encode(url[starting_position])[0];
      // Per spec we check it's an allowed character:
      // https://github.com/google/eddystone/tree/master/eddystone-url#eddystone-url-http-url-encoding
      if (encoded_character <= 0x20 || encoded_character >= 0x7f) {
        throw new Error('Only graphic printable characters of the US-ASCII coded character set are supported.');
      }
      return {
        encoded: encoder.encode(url[starting_position])[0],
        realLength: 1 // Since are just returning a letter
      };
    }
  }
  module.exports = BeaconData;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./beacon-layout.js":4,"text-encoding":undefined}],4:[function(require,module,exports){
(() => {
  'use strict';

  /**
   * @module beacon-layout
   * @typicalname beacon
   */

  /**
     BeaconParser.
     @private
     @constant {number}
     @default
   */

  /**
     This class provides helper functions that relate to deconstructing beacon beacon.
     @alias module:beacon-layout
   */
  class BeaconParser {
    /**
       Constructs an ordered array of matchers, identifiers, advertised power, and data based
       on the beacon layout
     */
    static parseLayout(beaconLayout) {
      let matchers = [], ids = [], dataFields = [], power, layoutArray = [];
      layoutArray = beaconLayout.split(',');
      for (let i = 0; i < layoutArray.length; i++) {
        let field, field_params, field_type, range_start, range_end, expected;
        field = layoutArray[i];
        let split_array;
        split_array = field.split(/:|=|-/);
        field_type = split_array[0];
        range_start = split_array[1];
        range_end = split_array[2];
        expected = split_array[3];
        field_params = {
          start: parseInt(range_start),
          end: parseInt(range_end),
          length: parseInt(range_end) - parseInt(range_start) + 1
        };
        if (range_end.endsWith('v')) {
          field_params.var_length = true;
        }
        if (typeof expected !== 'undefined') {
          field_params.expected = expected;
        }
        switch (field_type) {
          case 'm':
          case 's':
            matchers.push(field_params);
            break;
          case 'i':
            ids.push(field_params);
            break;
          case 'd':
            dataFields.push(field_params);
            break;
          case 'p':
            power = field_params;
            break;
        }
      }
      return {
        matchers: matchers,
        ids: ids,
        dataFields: dataFields,
        power: power
      };
    }
  }
  module.exports = BeaconParser;
})();

},{}],5:[function(require,module,exports){
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
      if (!('beaconLayout' in options) && !('type' in options)) {
        throw new TypeError('Required member type or beaconLayout is undefined.');
      }
      if (!('manufacturerId' in options) && !('serviceUuid' in options)) {
        throw new TypeError('Required member manufacturerId or serviceUuid is undefined.');
      }
      if (('manufacturerId' in options) && ('serviceUuid' in options)) {
        throw new TypeError('manufacturerId and serviceUuid can\'t both be defined for an advertisement.');
      }

      let type = options.type;
      let beaconLayout = options.beaconLayout;

      if ('manufacturerId' in options) {
        let manufacturerId = options.manufacturerId;
        self.beaconTypes[type] = {
          beaconLayout: beaconLayout,
          manufacturerId: manufacturerId
        };
      } else if ('serviceUuid' in options) {
        let serviceUuid = options.serviceUuid;
        self.beaconTypes[type] = {
          beaconLayout: beaconLayout,
          serviceUuid: serviceUuid
        };
      }
    }

    registerDefaultBeaconTypes() {
      let defaultBeaconTypes;
      defaultBeaconTypes = [
        {
          type: 'altbeacon',
          beaconLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
          manufacturerId: 0x0118
        },
        {
          type: 'eddystone_uid',
          beaconLayout: 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19,d:20-21',
          serviceUuid: 0xFEAA
        },
        {
          type: 'eddystone_url',
          beaconLayout: 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v',
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
      if (!('beaconLayout' in options.beaconType)) {
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

},{"./platform.js":7}],6:[function(require,module,exports){
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
},{"./beacon.js":5}],7:[function(require,module,exports){
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

},{"./beacon-chrome-os.js":2}]},{},[6]);
