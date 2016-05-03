<img src="http://i.imgur.com/by9OihN.png" style="display: block; margin-left: auto; margin-right: auto; width: 70%; padding: 10px;" />

# JavaScript Beacon Library

A JavaScript library for broadcasting BLE Beacon advertisements, wrapping existing
advertising APIs to make beacon transmission easier for developers.  The library
is flexible, supporting custom beacon types that can be registered with a `beaconLayout`
 similar to the [Android Beacon Library](https://altbeacon.github.io/android-beacon-library/)
 and [ScanBeacon Ruby Gem](https://github.com/RadiusNetworks/scanbeacon-gem).  The
 following beacon types are also supported by default:

 - [AltBeacon](http://altbeacon.org/)
 - [Eddystone UID](https://github.com/google/eddystone/tree/master/eddystone-uid)
 - [Eddystone URL](https://github.com/google/eddystone/tree/master/eddystone-url)

**NOTE** Currently only the Chrome OS platform is supported.

## Usage
The JavaScript Beacon Library creates `window.beacon` of type
[`Beacon`](#beacon)

### Advertising

To register an advertisement use the `registerAdvertisement()` method:

#### AltBeacon

```js
let registered_adv;
beacon.registerAdvertisement({
  type: 'altbeacon',
  ids: ['2F234454CF6D4A0FADF2F4911BA9FFA6', 1, 1],
  advertisedTxPower: -59
}).then(advertisement => {
  registered_adv = advertisement;
  console.log('Advertising: ' + advertisement)
}).catch(error => console.log(error.message));
```

#### Eddystone UID

```js
let registered_adv;
beacon.registerAdvertisement({
  type: 'eddystone_uid',
  ids: ['2F234454F4911BA9FFA6', '000000000001'],
  advertisedTxPower: -20
}).then(advertisement => {
  registered_adv = advertisement;
  console.log('Advertising: ' + advertisement)
}).catch(error => console.log(error.message));
```

#### Eddystone URL

```js
let registered_adv;
beacon.registerAdvertisement({
  type: 'eddystone_url',
  ids: ['http://example.com'],
  advertisedTxPower: -20
}).then(advertisement => {
  registered_adv = advertisement;
  console.log('Advertising: ' + advertisement)
}).catch(error => console.log(error.message));
```

### Stop advertising

To stop advertising use the `unregisterAdvertisement()` method:

```js
registered_adv.unregisterAdvertisement().then(() => {
  console.log('Advertisement unregistered successfully.');
}).catch(error => console.log(error.message));
```

Or if you have multiple advertisements:
```js
beacon.advertisements.forEach(advertisement => {
  advertisement.unregisterAdvertisement()
    .then(() => console.log('Unregistered successfully'))
    .catch(error => console.log('Couldn\'t unregister the advertisement: ' + error.message));
});
```

### Register a custom beacon type

To register a custom beacon type use the `registerBeaconType()` method:

```js
beacon.registerBeaconType({
  type: 'cool_beacon',
  beaconLayout: 'm:2-3=0000,i:4-19,i:20-21,i:22-23,p:24-24',
  manufacturerId: 0x1234
})
```

For more information on the `beaconLayout` check out
[this page](http://altbeacon.github.io/android-beacon-library/javadoc/org/altbeacon/beacon/BeaconParser.html#setBeaconLayout(java.lang.String))
from the Android Beacon Library docs.

## Build and test the library

Run browser/unit tests with npm:

```
$ npm run test
```

Build library with npm:

```
$ npm run browserify
```

After building the product can be found under the project root directory

## API
## Modules

<dl>
<dt><a href="#module_beacon-chrome-os">beacon-chrome-os</a></dt>
<dd></dd>
<dt><a href="#module_beacon-data">beacon-data</a></dt>
<dd></dd>
<dt><a href="#module_beacon-layout">beacon-layout</a></dt>
<dd></dd>
<dt><a href="#module_beacon">beacon</a></dt>
<dd></dd>
<dt><a href="#module_platform">platform</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#beacon">beacon</a> : <code>module:javascript-beacon-library</code></dt>
<dd><p>The global beacon instance.</p>
</dd>
</dl>

<a name="module_beacon-chrome-os"></a>

## beacon-chrome-os
<a name="exp_module_beacon-chrome-os--BeaconChromeOS"></a>

### BeaconChromeOS ⏏
This class wraps the underlying ChromeOS BLE Advertising API.

**Kind**: Exported class  
<a name="module_beacon-data"></a>

## beacon-data

* [beacon-data](#module_beacon-data)
    * [BeaconData](#exp_module_beacon-data--BeaconData) ⏏
        * [.constructBeaconData()](#module_beacon-data--BeaconData.constructBeaconData)
        * [.getByteArray(value)](#module_beacon-data--BeaconData.getByteArray) ⇒ <code>Array.&lt;number&gt;</code>

<a name="exp_module_beacon-data--BeaconData"></a>

### BeaconData ⏏
This class provides helper functions that relate to constructing beacon data.

**Kind**: Exported class  
<a name="module_beacon-data--BeaconData.constructBeaconData"></a>

#### BeaconData.constructBeaconData()
Constructs valid beacon manufacturer or service data for different beacon types

**Kind**: static method of <code>[BeaconData](#exp_module_beacon-data--BeaconData)</code>  
<a name="module_beacon-data--BeaconData.getByteArray"></a>

#### BeaconData.getByteArray(value) ⇒ <code>Array.&lt;number&gt;</code>
Validates the give array of bytes or converts the hex string into an array of bytes.

**Kind**: static method of <code>[BeaconData](#exp_module_beacon-data--BeaconData)</code>  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of bytes.  
**Throws**:

- <code>TypeError</code> If |value| is not an array or a string.
- <code>Error</code> If |value| contains out-of-range numbers or characters.


| Param | Type | Description |
| --- | --- | --- |
| value | <code>Array.&lt;number&gt;</code> &#124; <code>string</code> | The value to encode. |

<a name="module_beacon-layout"></a>

## beacon-layout

* [beacon-layout](#module_beacon-layout)
    * [BeaconParser](#exp_module_beacon-layout--BeaconParser) ⏏
        * [.parseLayout()](#module_beacon-layout--BeaconParser.parseLayout)

<a name="exp_module_beacon-layout--BeaconParser"></a>

### BeaconParser ⏏
This class provides helper functions that relate to deconstructing beacon beacon.

**Kind**: Exported class  
<a name="module_beacon-layout--BeaconParser.parseLayout"></a>

#### BeaconParser.parseLayout()
Constructs an ordered array of matchers, identifiers, advertised power, and data based
       on the beacon layout

**Kind**: static method of <code>[BeaconParser](#exp_module_beacon-layout--BeaconParser)</code>  
<a name="module_beacon"></a>

## beacon
<a name="module_platform"></a>

## platform
<a name="exp_module_platform--platform"></a>

### platform() ⇒ <code>Object</code> ⏏
Detects what API is available in the platform.

**Kind**: Exported function  
**Returns**: <code>Object</code> - An object that wraps the underlying BLE
  Advertising API  
**Throws**:

- <code>Error</code> If the platform is unsupported

<a name="beacon"></a>

## beacon : <code>module:javascript-beacon-library</code>
The global beacon instance.

**Kind**: global variable  
