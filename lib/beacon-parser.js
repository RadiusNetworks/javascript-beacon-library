(() => {
  'use strict';

  /**
   * @module beacon-parser
   * @typicalname parser
   */

  /**
     BeaconParser.
     @private
     @constant {number}
     @default
   */

  /**
     This class provides helper functions that relate to deconstructing beacon parser.
     @alias module:beacon-parser
   */
  class BeaconParser {
    /**
       Constructs an ordered array of matchers, identifiers, advertised power, and data based
       on the parser layout
     */
    static parseLayout(parserLayout) {
      let matchers = [], ids = [], dataFields = [], power, layoutArray = [];
      layoutArray = parserLayout.split(',');
      for (let i = 0; i < layoutArray.length; i++) {
        let field, field_params, field_type, range_start, range_end, expected;
        field = layoutArray[i];
        let split_array;
        split_array = field.split(/:|=|-/);
        field_type = split_array[0];
        range_start = split_array[1];
        range_end = split_array[2];
        expected = split_array[3];
        field_params = {
          start: parseInt(range_start),
          end: parseInt(range_end),
          length: parseInt(range_end) - parseInt(range_start) + 1
        };
        if (range_end.endsWith('v')) {
          field_params.var_length = true;
        }
        if (typeof expected !== 'undefined') {
          field_params.expected = expected;
        }
        switch (field_type) {
          case 'm':
          case 's':
            matchers.push(field_params);
            break;
          case 'i':
            ids.push(field_params);
            break;
          case 'd':
            dataFields.push(field_params);
            break;
          case 'p':
            power = field_params;
            break;
        }
      }
      return {
        matchers: matchers,
        ids: ids,
        dataFields: dataFields,
        power: power
      };
    }
  }
  module.exports = BeaconParser;
})();
