(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["javascriptBeaconLibrary"] = factory();
	else
		root["javascriptBeaconLibrary"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var platform = __webpack_require__(1);
	
	var Beacon = function () {
	  function Beacon() {
	    _classCallCheck(this, Beacon);
	
	    this._platform = platform();
	    this.advertisements = [];
	  }
	
	  _createClass(Beacon, [{
	    key: 'registerAdvertisement',
	    value: function registerAdvertisement(options) {
	      var self = this;
	      return new Promise(function (resolve, reject) {
	        if (!self._platform) {
	          reject(new Error('Platform not supported.'));
	          return;
	        }
	        Beacon._checkAdvertisementOptions(options);
	        return self._platform.registerAdvertisement(options).then(function (advertisement) {
	          self.advertisements.push(advertisement);
	          resolve(advertisement);
	        }, reject);
	      });
	    }
	  }], [{
	    key: '_checkAdvertisementOptions',
	    value: function _checkAdvertisementOptions(options) {
	      if (!('type' in options)) {
	        throw new TypeError('Required member type is undefined.');
	      }
	    }
	  }]);
	
	  return Beacon;
	}();
	
	exports.default = Beacon;
	
	// // AltBeacon
	// beacon.registerAdvertisement({
	//   type: 'altbeacon',
	//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
	//   advertisedTxPower: -59,
	//   manufacturerId: 0x0118
	// })
	//
	// // iBeacon
	// beacon.registerAdvertisement({
	//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
	//   advertisedTxPower: -59,
	//   manufacturer: 0x004c,
	//   parserLayout: ':2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24'
	// })
	//
	// // Eddystone UID
	// beacon.registerAdvertisement({
	//   type: 'eddystone_uid',
	//   ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
	//   advertisedTxPower: -20,
	//   serviceUuid: 0xFEAA
	// })
	//
	// // Eddystone URL
	// beacon.registerAdvertisement({
	//   type: 'eddystone_url',
	//   ids: ['http://radiusnetworks.com'],
	//   advertisedTxPower: -20,
	//   serviceUuid: 0xFEAA
	// })

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var BeaconChromeOS = __webpack_require__(2);
	
	function platform() {
	  if (typeof chrome !== 'undefined') {
	    return BeaconChromeOS;
	  } else if (typeof BEACON_TEST !== 'undefined') {
	    return {};
	  } else {
	    throw new Error('Unsupported platform.');
	  }
	}
	
	exports.default = platform;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var BeaconAdvertisement = __webpack_require__(3).BeaconAdvertisement;
	
	var BeaconChromeOS = function () {
	  function BeaconChromeOS() {
	    _classCallCheck(this, BeaconChromeOS);
	  }
	
	  _createClass(BeaconChromeOS, null, [{
	    key: 'registerAdvertisement',
	    value: function registerAdvertisement(options) {
	      return new Promise(function (resolve, reject) {
	        var chromeAdv = BeaconChromeOS._constructAdvertisement(options);
	
	        chrome.bluetoothLowEnergy.registerAdvertisement(chromeAdv, function (advertisementId) {
	          if (chrome.runtime.lastError) {
	            reject(new Error(chrome.runtime.lastError.message));
	            return;
	          }
	          resolve(new BeaconAdvertisement(advertisementId, options, BeaconChromeOS));
	        });
	      });
	    }
	  }, {
	    key: 'unregisterAdvertisement',
	    value: function unregisterAdvertisement(advertisement) {
	      return new Promise(function (resolve, reject) {
	        chrome.bluetoothLowEnergy.unregisterAdvertisement(advertisement.id, function () {
	          if (chrome.runtime.lastError) {
	            reject(new Error(chrome.runtime.lastError.message));
	            return;
	          }
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: '_constructAdvertisement',
	    value: function _constructAdvertisement(options) {
	      var data = void 0;
	      var advertisement = void 0;
	
	      data = Beacon.constructManufacturerData(options.id1, etc, options.advertisedTxPower);
	      advertisement = {
	        type: 'broadcast',
	        manufacturerData: [{
	          id: IBEACON_ID,
	          data: data
	        }]
	      };
	      return advertisement;
	    }
	  }]);
	
	  return BeaconChromeOS;
	}();
	
	exports.default = BeaconChromeOS;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var BeaconAdvertisement = function () {
	  function BeaconAdvertisement(id, options, platform) {
	    _classCallCheck(this, BeaconAdvertisement);
	
	    if (typeof platform === 'undefined') {
	      throw new TypeError('Required member platform is undefined');
	    }
	    this._platform = platform;
	    this.id = undefined;
	    this.type = undefined;
	
	    /**
	    The calibrated measured Tx power of the Beacon in RSSI
	    This value is baked into an Beacon when it is manufactured, and
	    it is transmitted with each packet to aid in the mDistance estimate
	    */
	    this.advertisedTxPower = undefined;
	
	    /**
	    A list of the multi-part identifiers of the beacon.  Together, these identifiers signify
	    a unique beacon.  The identifiers are ordered by significance for the purpose of grouping
	    beacons
	    */
	    this.identifiers = undefined;
	
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
	    this.manufacturer = undefined;
	
	    /**
	    A 32 bit service uuid for the beacon
	    This is valid only for GATT-based beacons.   If the beacon is a manufacturer data-based
	    beacon, this field will be -1
	    */
	    this.serviceUuid = undefined;
	  }
	
	  /**
	  Unregisters the current advertisement.
	  @fulfill {void} - If the advertisement was unregistered successfully.
	  @reject {Error} - If the advertisement failed to be registered. If
	  the promise rejects the advertisment may still be broadcasting. The only
	  way to recover may be to reboot your machine.
	  @returns {Promise.<void>}
	  */
	
	
	  _createClass(BeaconAdvertisement, [{
	    key: 'unregisterAdvertisement',
	    value: function unregisterAdvertisement() {
	      return this._platform.unregisterAdvertisement(this);
	    }
	  }]);
	
	  return BeaconAdvertisement;
	}();
	
	exports.default = BeaconAdvertisement;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=javascript-beacon-library.js.map