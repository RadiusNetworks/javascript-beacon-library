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
