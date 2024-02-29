import * as dgram from 'dgram';
import { 
  IndustrialCommunicationsInterface, 
  Directive,
 } from '../src/lib';

 const udpListener: dgram.Socket = dgram.createSocket('udp4');
 const PORT: number = 44818;
 udpListener.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
  if (rinfo.address !== "192.168.1.85") {
    console.log(`UDP Received: ${msg}`);
  };
 });
 
 udpListener.on('error', (err: Error) => {
   console.error(`UDP server error:\n${err.stack}`);
   udpListener.close();
 });
 
 udpListener.bind(PORT, () => {
   console.log(`UDP Listener Opened On Port: ${PORT}`);
 });

const micro800 = IndustrialCommunicationsInterface.newDevice(
  { 
    macAddress: "FF:FF:FF:FF:FF:FF", 
    host: "192.168.85.10", 
    port: 44818,
    localPort: null,
  }, true,
  () => {
    console.log("Connected");
    micro800?.request(
      Directive.List_Services, 
      [
        [0x0000, 2], // EIP Header length field

        [0x0000, 2], [0x0400, 2], [0x0002, 2], 
        [0x0000, 2], [0x0000, 2], [0x00B2, 2], 
        [0x000A, 2], 
        // Item #2 (No data required for null address item)
        [0x0091, 2], [0x0006, 2], [0x0002, 2],        
        [0x0000, 2], [0x09, 1],          
        // Symbolic Tag Name ("EIP_DEBUG")
        [0x45, 1], [0x49, 1], [0x50, 1], 
        [0x5F, 1], [0x44, 1], [0x45, 1], 
        [0x42, 1], [0x55, 1], [0x47, 1],              
        [0x0000, 2]
      ],
      (buffer: Buffer) => {
        logBuffer(buffer);
      });
    },
  (error: any) => {
    console.log(error);
  }
);

function parseResponse_ForwardOpen(buffer: Buffer, responseDirective: Directive): void {
  switch(buffer[0]) {
    case 0x65:
      micro800?.setSessionHandle(buffer.readUInt32BE(4));
      switch(responseDirective) {
        case 0x01:
        break;
      };
    break;
  };
};

function logBuffer(buffer: Buffer) {
  console.log("Received: ", buffer);
};