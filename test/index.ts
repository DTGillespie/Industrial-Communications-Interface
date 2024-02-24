import * as dgram from 'dgram';
import { 
  IndustrialCommunicationsInterface, 
  Directive,
 } from '../src/lib';

 const server: dgram.Socket = dgram.createSocket('udp4');
 
 const PORT: number = 44818;
 
 server.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
   console.log(`Received message from ${rinfo.address}:${rinfo.port}: ${msg}`);
 });
 
 server.on('error', (err: Error) => {
   console.error(`UDP server error:\n${err.stack}`);
   server.close();
 });
 
 server.bind(PORT, () => {
   console.log(`UDP server listening on port ${PORT}`);
 });
const micro800 = IndustrialCommunicationsInterface.newDevice(
  { 
    macAddress: "FF:FF:FF:FF:FF:FF", 
    host: "192.168.1.163", 
    port: 44818,
    localPort: null,
  }, true,
  () => {
    console.log("Connected");
    micro800?.request(Directive.Forward_Open, (buffer: Buffer) => {
      console.log("Buffer: ", buffer);
      logBuffer(buffer);
      parseResponse_ForwardOpen(
        buffer, 
        Directive.Get_Attribute_Single
      );
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
          micro800?.request(Directive.Get_Attribute_Single, (buffer: Buffer) => {
            logBuffer(buffer);
          },[
            [0x0E, 1]  , // Service
            [0x0004, 2], // Path Size: 16-bit Words (Inclusive of itself)
            [0x0001, 2], // Class ID: 0x01 Identity Object
            [0x0001, 2], // Instance ID: 0x01
            [0x0001, 2], // Attribute ID
          ]);
        break;
      };
    break;
  };
};

function logBuffer(buffer: Buffer) {
  console.log("Received: ", buffer);
};