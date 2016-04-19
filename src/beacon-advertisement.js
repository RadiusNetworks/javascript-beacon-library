'use strict';

class BeaconAdvertisement {

  constructor(id, options, platform) {
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
  unregisterAdvertisement() {
    return this._platform.unregisterAdvertisement(this);
  }
}

export default BeaconAdvertisement;
