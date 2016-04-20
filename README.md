# Javascript Beacon Library

A JavaScript library for broadcasting Beacon advertisements

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
