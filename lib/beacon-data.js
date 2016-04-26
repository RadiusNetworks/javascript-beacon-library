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

  let BeaconParser = require('./beacon-parser.js');

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
      let layout = BeaconParser.parseLayout(beacon_type.parserLayout);
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
        if (beacon_type.parserLayout === 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v') {
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
