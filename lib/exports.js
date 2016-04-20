(() => {
  'use strict';

  // Only require top level module. Browserify will walk
  // the dependency graph and load all needed modules.
  let Beacon = require('./beacon.js');

  /**
   * The global beacon instance.
   *
   * @global
   * @type module:javascript-beacon-library
   */
   global.beacon = new Beacon();
})();
