// jshint node: true
// We need this so chai `expect` statements don't throw an error.
// jshint expr: true
'use strict';

import chai, {expect} from 'chai';
import BeaconData from '../../lib/beacon-data.js';

describe('BeaconData', () => {
  describe('constructBeaconData()', () => {
    it('Constructs valid AltBeacon data', () => {
      let dataArray = [190,172,226,197,109,181,223,251,72,210,176,96,208,245,167,16,150,224,3,99,20,189,197,0];
      let beacon_type = {
        beaconLayout: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
        manufacturerId: 0x0118
      };
      let ids = ['E2C56DB5DFFB48D2B060D0F5A71096E0', 867, 5309];
      let advertisedTxPower = -59;
      let beaconData = BeaconData.constructBeaconData(beacon_type, ids, advertisedTxPower);
      expect(beaconData).to.eql(dataArray);
    });
    it('Constructs valid Eddystone UID data', () => {
      let dataArray = [0,-20,47,35,68,84,244,145,27,169,255,166,0,0,0,0,0,1,0,0];
      let beacon_type = {
        beaconLayout: 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19,d:20-21',
        serviceUuid: 0xFEAA
      };
      let ids = ['2F234454F4911BA9FFA6', '000000000001'];
      let advertisedTxPower = -20;
      let beaconData = BeaconData.constructBeaconData(beacon_type, ids, advertisedTxPower);
      expect(beaconData).to.eql(dataArray);
    });
    it('Constructs valid Eddystone URL data', () => {
      let dataArray = [16,-20,2,114,97,100,105,117,115,110,101,116,119,111,114,107,115,7];
      let beacon_type = {
        beaconLayout: 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v',
        serviceUuid: 0xFEAA
      };
      let ids = ['http://radiusnetworks.com'];
      let advertisedTxPower = -20;
      let beaconData = BeaconData.constructBeaconData(beacon_type, ids, advertisedTxPower);
      expect(beaconData).to.eql(dataArray);
    });
  });
  describe('getByteArray()', () => {
    it('Invalid type', () => {
      expect(() => BeaconData.getByteArray({}, 5)).to.throw(TypeError);
    });
    it('Valid String', () => {
      expect(BeaconData.getByteArray('FF00', 2)).to.eql([0xFF, 0]);
    });
    it('Invalid String', () => {
      expect(() => BeaconData.getByteArray('GGGG', 2)).to.throw(Error);
    });
    it('Valid Number', () => {
      expect(BeaconData.getByteArray(1, 2)).to.eql([0, 0x01]);
    });
    it('Invalid Number', () => {
      expect(() => BeaconData.getByteArray(65536, 2)).to.throw(Error);
    });
    it('Valid byte array', () => {
      expect(BeaconData.getByteArray([1, 2, 3, 4], 4)).to.eql([1, 2, 3, 4]);
    });
    it('Invalid byte array', () => {
      expect(() => BeaconData.getByteArray([0xF00], 1)).to.throw(Error);
    });
  });
  describe('getHexString()', () => {
    it('Valid String', () => {
      expect(BeaconData.getHexString([0xFF])).to.eql('ff');
    });
    it('Invalid String', () => {
      expect(() => BeaconData.getHexString([0xF00])).to.throw(Error);
    });
  });
  describe('_encodeString()', () => {
    it('Odd expected length', () => {
      expect(() => BeaconData._encodeString('012', 3)).to.throw(/length/);
    });
    it('Too Long String', () => {
      expect(() => BeaconData._encodeString('010203', 4)).to.throw(/length/);
    });
    it('Too Short String', () => {
      expect(() => BeaconData._encodeString('01', 4)).to.throw(/length/);
    });
    it('Correct Length String', () => {
      expect(BeaconData._encodeString('0102', 4)).to.eql([1,2]);
    });
    it('Invalid characters String', () => {
      expect(() => BeaconData._encodeString('010G', 4)).to.throw(/character/);
    });
    it('Valid String', () => {
      expect(BeaconData._encodeString('abcdef', 6)).eql([0xab, 0xcd, 0xef]);
    });
  });
  describe('_encodeNumber()', () => {
    it('Too Large Number', () => {
      expect(() => BeaconData._encodeNumber(65536, 2)).to.throw(/hex number/);
    });
    it('Too Small Number', () => {
      expect(() => BeaconData._encodeNumber(-1, 2)).to.throw(/hex number/);
    });
    it('Correct Number', () => {
      expect(BeaconData._encodeNumber(65535, 2)).to.eql([0xff,0xff]);
    });
    it('Invalid characters Number', () => {
      expect(() => BeaconData._encodeNumber('string', 2)).to.throw(/number/);
    });
    it('Valid Number', () => {
      expect(BeaconData._encodeNumber(1, 2)).eql([0, 0x01]);
    });
  });
  describe('_validateByteArray()', () => {
    it('Too long array', () => {
      expect(() => BeaconData._validateByteArray([1,2,3], 2)).to.throw(/length/);
    });
    it('Too short array', () => {
      expect(() => BeaconData._validateByteArray([1], 2)).to.throw(/length/);
    });
    it('Wrong type in array', () => {
      expect(() => BeaconData._validateByteArray([1, {}], 2)).to.throw(/value/);
    });
    it('Wrong value in array', () => {
      expect(() => BeaconData._validateByteArray([1, 0xF00], 2)).to.throw(/value/);
    });
  });
  describe('encodeURLScheme', () => {
   it('http://www.', () => {
     expect(typeof BeaconData._encodeURLScheme).to.eql('function');
     expect(BeaconData._encodeURLScheme('http://www.example.com')).to.eql({
       length: 11,
       encoded: 0});
   });

   it('https://www.', () => {
     expect(BeaconData._encodeURLScheme('https://www.example.com')).to.eql({
       length: 12,
       encoded: 1});
   });

   it('http://', () => {
     expect(BeaconData._encodeURLScheme('http://example.com')).to.eql({
       length: 7,
       encoded: 2});
   });

   it('https://', () => {
     expect(BeaconData._encodeURLScheme('https://example.com')).to.eql({
       length: 8,
       encoded: 3});
   });

   it('Empty URL', () => {
     expect(() => BeaconData._encodeURLScheme('')).to.throw(Error);
   });

   it('http:/', () => {
     expect(() => BeaconData._encodeURLScheme('http:/')).to.throw(Error);
   });
 });
 describe('encodeURLFragment()', () => {
   it('URL code at the beginning', () => {
     expect(BeaconData._encodeURLFragment('.org/', 0)).to.eql({
       encoded: 0x1,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.edu/', 0)).to.eql({
       encoded: 0x2,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.net/', 0)).to.eql({
       encoded: 0x3,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.info/', 0)).to.eql({
       encoded: 0x4,
       realLength: 6
     });
     expect(BeaconData._encodeURLFragment('.biz/', 0)).to.eql({
       encoded: 0x5,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.gov/', 0)).to.eql({
       encoded: 0x6,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.com', 0)).to.eql({
       encoded: 0x7,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('.org', 0)).to.eql({
       encoded: 0x8,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('.edu', 0)).to.eql({
       encoded: 0x9,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('.net', 0)).to.eql({
       encoded: 0xa,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('.info', 0)).to.eql({
       encoded: 0xb,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('.biz', 0)).to.eql({
       encoded: 0xc,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('.gov', 0)).to.eql({
       encoded: 0xd,
       realLength: 4
     });
   });
   it('URL code at the end', () => {
     // Since 7 is the argument passed to _encodeURLFragment the function
     // starts looking for a URL Code at that position and therefore finds one.
     expect(BeaconData._encodeURLFragment('example.com/', 7)).to.eql({
       encoded: 0x0,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.org/', 7)).to.eql({
       encoded: 0x1,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.edu/', 7)).to.eql({
       encoded: 0x2,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.net/', 7)).to.eql({
       encoded: 0x3,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.info/', 7)).to.eql({
       encoded: 0x4,
       realLength: 6
     });
     expect(BeaconData._encodeURLFragment('example.biz/', 7)).to.eql({
       encoded: 0x5,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.gov/', 7)).to.eql({
       encoded: 0x6,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.com', 7)).to.eql({
       encoded: 0x7,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.org', 7)).to.eql({
       encoded: 0x8,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.edu', 7)).to.eql({
       encoded: 0x9,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.net', 7)).to.eql({
       encoded: 0xa,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.info', 7)).to.eql({
       encoded: 0xb,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.biz', 7)).to.eql({
       encoded: 0xc,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.gov', 7)).to.eql({
       encoded: 0xd,
       realLength: 4
     });
   });

   it('URL code in the middle', () => {
     expect(BeaconData._encodeURLFragment('example.com/?q=10', 7)).to.eql({
       encoded: 0x0,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.org/?q=10', 7)).to.eql({
       encoded: 0x1,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.edu/?q=10', 7)).to.eql({
       encoded: 0x2,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.net/?q=10', 7)).to.eql({
       encoded: 0x3,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.info/?q=10', 7)).to.eql({
       encoded: 0x4,
       realLength: 6
     });
     expect(BeaconData._encodeURLFragment('example.biz/?q=10', 7)).to.eql({
       encoded: 0x5,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.gov/?q=10', 7)).to.eql({
       encoded: 0x6,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.com?q=10', 7)).to.eql({
       encoded: 0x7,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.org?q=10', 7)).to.eql({
       encoded: 0x8,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.edu?q=10', 7)).to.eql({
       encoded: 0x9,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.net?q=10', 7)).to.eql({
       encoded: 0xa,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.info?q=10', 7)).to.eql({
       encoded: 0xb,
       realLength: 5
     });
     expect(BeaconData._encodeURLFragment('example.biz?q=10', 7)).to.eql({
       encoded: 0xc,
       realLength: 4
     });
     expect(BeaconData._encodeURLFragment('example.gov?q=10', 7)).to.eql({
       encoded: 0xd,
       realLength: 4
     });
   });

   it('No url code', () => {
     expect(BeaconData._encodeURLFragment('example.com', 0)).to.eql({
       encoded: 101, // ASCII 'e'
       realLength: 1
     });
   });

   it('Invalid characters', () => {
     expect(() => BeaconData._encodeURLFragment(String.fromCharCode(0x0), 0)).to.throw(Error);
     expect(() => BeaconData._encodeURLFragment(String.fromCharCode(0x20), 0)).to.throw(Error);
     expect(() => BeaconData._encodeURLFragment(String.fromCharCode(0x7f), 0)).to.throw(Error);

     expect(() => BeaconData._encodeURLFragment(String.fromCharCode(0x21), 0)).to.not.throw();
     expect(() => BeaconData._encodeURLFragment(String.fromCharCode(0x7e), 0)).to.not.throw();
   });
 });

 describe('encodeURL()', () => {
   it('https://www.example.com', () => {
     expect(BeaconData.encodeURL('https://www.example.com')).to.eql([
       1, // https://www
       101, 120, 97, 109, 112, 108, 101, // example
       7 // .com
     ]);
   });
 });
});
