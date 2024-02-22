import { 
  IndustrialCommunicationsInterface, 
  Directive,
 } from '../src/lib';

const micro800 = IndustrialCommunicationsInterface.newDevice(
  { 
    macAddress: "5C:88:16:D7:4E:11", 
    host: "192.168.85.10", 
    port: 44818,
    localPort: 47687,
  }, true,
  () => {
    console.log("Connected");
    micro800?.request(Directive.Forward_Open, () => {
      console.log("Debug Response");
    });
  },
  (error: any) => {
    console.log(error);
  }
);