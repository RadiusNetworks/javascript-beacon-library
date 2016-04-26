// jshint node: true
// We need this so chai `expect` statements don't throw an error.
// jshint expr: true
'use strict';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import {BeaconAdvertisement} from '../../lib/beacon-advertisement.js';
// jshint ignore:end

describe('BeaconAdvertisement', () => {
  // Tell platform.js we are running tests.
  before(() => global._beacon_test = true);
  // Remove global.
  after(() => global._beacon_test = undefined);

  describe('constructor()', () => {
    it('Check beacon assignment', () => {
      let id = 100;
      let type = 'altbeacon';
      let beaconType = {
        parserLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
        manufacturerId: 0x0118
      };
      let ids = ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1];
      let tx_power = -10;
      let manufacturer = 0x0118;
      let adv = new BeaconAdvertisement(
        id, {
          type: type,
          beaconType: beaconType,
          ids: ids,
          advertisedTxPower: tx_power,
          manufacturerId: manufacturer
        },
        {} /* platform */);
      // AltBeacon members
      expect(adv.id).to.eql(id);
      expect(adv.type).to.eql(type);
      expect(adv.beaconType).to.eql(beaconType);
      expect(adv.ids).to.eql(ids);
      expect(adv.advertisedTxPower).to.eql(tx_power);
      expect(adv._platform).to.eql({});
    });
  });

  describe('unregisterAdvertisement()', () => {
    it('Unregistering fails', () => {
      let advertisement = new BeaconAdvertisement(100 /* id */, {
        type: 'altbeacon',
        beaconType: {
          parserLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
          manufacturerId: 0x0118
        },
        ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
        advertisedTxPower: -59,
        manufacturerId: 0x0118
      }, {});
      let error = new Error('Failed');
      advertisement._platform.unregisterAdvertisement = sinon.stub().returns(Promise.reject(error));
      return expect(advertisement.unregisterAdvertisement()).to.be.rejectedWith(error);
    });

    it('Unregistering succeeds', () => {
      let advertisement = new BeaconAdvertisement(100 /* id */, {
        type: 'altbeacon',
        beaconType: {
          parserLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
          manufacturerId: 0x0118
        },
        ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
        advertisedTxPower: -59,
        manufacturerId: 0x0118
      }, {});
      advertisement._platform.unregisterAdvertisement = sinon.stub().returns(
        Promise.resolve());
      return expect(advertisement.unregisterAdvertisement()).to.be.fulfilled;
    });
  });
});
