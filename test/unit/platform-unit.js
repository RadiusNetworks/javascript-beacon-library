// jshint node: true
// We need this so chai `expect` statements don't throw an error.
// jshint expr: true
'use strict';

import chai, {expect} from 'chai';
import platform from '../../lib/platform.js';
import BeaconChromeOS from '../../lib/beacon-chrome-os.js';

describe('Platform', () => {
  describe('platform()', () => {
    // Hooks
    afterEach(() => {
      global._beacon_test = undefined;
      global.chrome = undefined;
    });

    it('unsupported', () => {
      expect(() => platform()).to.throw(/Unsupported platform./);
    });

    it('chrome', () => {
      global.chrome = {};
      expect(platform()).to.eql(BeaconChromeOS);
    });

    it('test', () => {
      global._beacon_test = {};
      expect(platform()).to.eql({});
    });
  });
});
