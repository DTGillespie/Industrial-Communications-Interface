import { 
  IndustrialCommunicationsInterface, 
  Directive,
 } from '../src/lib';

const micro800 = IndustrialCommunicationsInterface.newDevice({
  macAddress: "fe80::1f4d:d487:75c3:498e", 
  host: "192.168.1.163", 
  port: 44818
});

micro800?.request(Directive.Forward_Open, () => {
  console.log("Debug");
});