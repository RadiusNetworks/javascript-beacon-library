// jshint node: true
// We need this so chai `expect` statements don't throw an error.
// jshint expr: true
'use strict';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import BeaconParser from '../../lib/beacon-parser.js';
// jshint ignore:end

describe('BeaconParser', () => {

  describe('parseLayout()', () => {
    it('Parses a valid layout', () => {
      let parserLayout = 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25';
      let parsedLayout = BeaconParser.parseLayout(parserLayout);
      expect(parsedLayout.matchers).to.eql([
        { start: 2, end: 3, length: 2, expected: 'beac' }
      ]);
      expect(parsedLayout.ids).to.eql([
        { start: 4, end: 19, length: 16 },
        { start: 20, end: 21, length: 2 },
        { start: 22, end: 23, length: 2 }
      ]);
      expect(parsedLayout.dataFields).to.eql([
        { start: 25, end: 25, length: 1 }
      ]);
      expect(parsedLayout.power).to.eql({ start: 24, end: 24, length: 1 });
    });
  });
});
