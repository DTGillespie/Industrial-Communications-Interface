import { 
  IndustrialCommunicationsInterface, 
  PacketConstructor, 
  Directive,
 } from '../src/lib';

const micro800 = IndustrialCommunicationsInterface.newDevice({
  MAC_ADDRESS: "fe80::1f4d:d487:75c3:498e", 
  HOST: "192.168.1.163", 
  PORT: 44818
});

micro800?.request(Directive.Forward_Open, () => {
  console.log("Debug");
});