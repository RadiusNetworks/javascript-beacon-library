'use strict';

class BeaconParser {
  DEFAULT_LAYOUTS = {
    altbeacon: 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25',
    eddystoneUid: 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19;d:20-21',
    eddystoneUrl: 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-21v',
    eddystoneTlm: 's:0-1=feaa,m:2-2=20,d:3-3,d:4-5,d:6-7,d:8-11,d:12-15',
    eddystoneEid: 's:0-1=feaa,m:2-2=30,p:3-3:-41,i:4-11',
  };

}

export default BeaconParser;
