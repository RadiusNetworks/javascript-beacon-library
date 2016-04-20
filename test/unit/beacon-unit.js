// jshint node: true
// We need this so chai `expect` statements don't throw an error.
// jshint expr: true
'use strict';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import Beacon from '../../lib/beacon.js';

describe('Beacon', () => {
  // Tell platform.js we are running tests.
  before(() => global._beacon_test = true);
  // Remove global.
  after(() => global._beacon_test = undefined);

  describe('checkAdvertisementOptions()', () => {
    describe('general', () => {
      it('Unsupported type, no ids, no advertisedTxPower', () => {
        expect(() => Beacon._checkAdvertisementOptions({type: 'ibeacon'}))
                              .to.throw(TypeError, /Frame Type/);
      });
      it('No type or parserLayout', () => {
        expect(() => Beacon._checkAdvertisementOptions({})).to.throw(TypeError, /type|parserLayout/);
      });
    });

    describe('type', () => {
      [{
        name: 'No  type, no ids, no advertisedTxPower',
        options: {},
        errorRegex: /type|parserLayout/
      }, {
        name: 'Yes type, no ids, no advertisedTxPower',
        options: {type: 'altbeacon'},
        errorRegex: /ids|advertisedTxPower/
      }, {
        name: 'No type, no ids, yes advertisedTxPower',
        options: {advertisedTxPower: 0},
        errorRegex: /type/
      }, {
        name: 'Yes type, no ids, yes advertisedTxPower',
        options: {type: 'altbeacon', advertisedTxPower: 0},
        errorRegex: /ids/
      }, {
        name: 'No type, yes ids, no advertisedTxPower',
        options: {ids: ''},
        errorRegex: /type/
      }, {
        name: 'Yes type, yes ids, no advertisedTxPower',
        options: {type: 'altbeacon', ids: ''},
        errorRegex: /advertisedTxPower/
      }, {
        name: 'No type, yes ids, yes advertisedTxPower',
        options: {ids: '', advertisedTxPower: 0},
        errorRegex: /type/
      }].forEach(test => {
        it(test.name, () => {
          expect(() => Beacon._checkAdvertisementOptions(test.options))
            .to.throw(TypeError, test.errorRegex);
        });
      });

      it('Yes type, yes ids, yes advertisedTxPower', () => {
        expect(() => Beacon._checkAdvertisementOptions({
          type: 'altbeacon',
          ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
          advertisedTxPower: -59
        })).to.not.throw();
      });
    });
  });

  describe('registerAdvertisement()', () => {
    let options = {
      type: 'altbeacon',
      ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
      advertisedTxPower: -20,
    };

    it('Invalid options', () => {
      let beacon = new Beacon();
      return expect(beacon.registerAdvertisement({}))
                             .to.be.rejected;
    });

    it('Successfully register advertisement', () => {
      let mockAdvertisement = {};
      let beacon = new Beacon();
      beacon._platform.registerAdvertisement = sinon.stub().returns(
        Promise.resolve(mockAdvertisement));

      return expect(beacon
        .registerAdvertisement(options)).to.eventually.eql(mockAdvertisement)
        .then(() => {
          expect(beacon.advertisements).to.include(mockAdvertisement);
        });
    });

    it('Fail to register advertisement', () => {
      let error = new Error('Failed');
      let beacon = new Beacon();
      beacon._platform.registerAdvertisement = sinon.stub().returns(
        Promise.reject(error));
      // Use sinon.stub(object, 'method') so that we can use
      // object.method.restore() after the test finishes.

      return expect(beacon
        .registerAdvertisement(options)).to.be.rejectedWith(error);
    });
  });
});
