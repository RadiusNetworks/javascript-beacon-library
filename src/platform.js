'use strict';

let BeaconChromeOS = require('./beacon-chrome-os.js');

function platform() {
  if (typeof chrome !== 'undefined') {
    return BeaconChromeOS;
  } else if (typeof BEACON_TEST !== 'undefined') {
    return {};
  } else {
    throw new Error('Unsupported platform.');
  }
}

export default platform;
