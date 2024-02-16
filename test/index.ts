import { IndustrialCommunicationsInterface } from '../src/lib';

const micro800Sim = IndustrialCommunicationsInterface.newDevice({
  MAC_ADDRESS: "fe80::1f4d:d487:75c3:498e%17", 
  HOST: "192.168.1.163", 
  PORT: 44818
});

console.log(micro800Sim);