const net = require('net');
const dgram = require('dgram');

const REMOTE_HOST = '192.168.1.163';
const REMOTE_PORT = 44818;
const LOCAL_PORT = 56796;

let SESSION_HANDLE = null;

const socket = net.createConnection({
    host: REMOTE_HOST,
    port: REMOTE_PORT,
    localPort: LOCAL_PORT
});

socket.on('error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('close', () => {
    console.log('Socket connection closed.');
});

socket.on('connect', () => {
  console.log('Connected to PLC.');
  socket.write(build_forwardOpen_Packet());
});

socket.on('data', (buffer) => {
  console.log('Received: ', buffer);
  switch(buffer[0]) {
    case 0x65:
      SESSION_HANDLE = buffer.readUInt32BE(4);
			socket.write(build_getAttributeSingle_Packet());
    break;
  };
});

/*
const udpClient = dgram.createSocket('udp4');
udpClient.send(build_listIdentity_Packet(), REMOTE_PORT, REMOTE_HOST, (error) => {
  if (error) console.log(error);
  udpClient.close();
});
*/

function build_forwardOpen_Packet() {

  const buffer = Buffer.alloc(28);

  buffer.writeUInt16LE(0x0065, 0);                         // Command
  buffer.writeUInt16LE(0x0004, 2);                         // Length
  buffer.writeUInt32LE(0x00000001, 4);                     // Session Handle
  buffer.writeUInt32LE(0x00000000, 8);                     // Status
  buffer.writeBigUInt64LE(BigInt(0x0000000000000000), 12); // Context
  buffer.writeUInt32LE(0x00000000, 20);                    // Options

  // Command Specific Data
  buffer.writeUInt16LE(0x001, 24);                         // Protocol Version
  buffer.writeUInt16LE(0x0000, 26);                        // Options Flags

  return buffer;
};

function build_listIdentity_Packet() {

  const buffer = Buffer.alloc(28);

  const EIP_HEADER = [
    [0x0063, 0],                                     // Command: Send RR Data
    [0x0004, 2],                                     // Length
    [0x00000000, 4],                                 // Session Handle
    [0x00000000, 8],                                 // Status: Success
    [BigInt(0x0000000000000000), 12],                // Context
    [0x00000000, 20]                                 // Options: Null
  ];

  const COMMAND_SPECIFIC_DATA = [
    [0x0001, 24],                                    // Protocol Version
    [0x0000, 28],                                    // Options Flags
  ];  

  return buffer;
};

function build_getAttributeSingle_Packet() {

  const buffer = Buffer.alloc(50);

  const EIP_HEADER = [
      [0x006F, 0],                                     // Command: Send RR Data
      [0x001A, 2],                                     // Length
      [0x0000, 4],                                     // Session Handle
      [0x00000000, 8],                                 // Status: Success
      [BigInt(0x0000000000010000), 12],                // Context
      [0x0000, 20]                                     // Options: Null
  ];

  const COMMAND_SPECIFIC_DATA = [
      [0x0000, 24],                                    // Interface Handle: CIP
      [0x0400, 28],                                    // Timeout: 1024
      [0x0002, 30],                                    // Item Count
      [0x0000, 32],                                    // Null Address Item
      [0x0000, 34],                                    // ^ Length
      [0x00B2, 36],                                    // Unconnected Data Item
      [0x000A, 38]                                     // ^ Length
  ];

  const CIP_FRAME = [
      [0x0E, 40],                                      // Service
      [0x0004, 41],                                    // Path Size: 16-bit Words (Inclusive of itself)
      [0x0001, 43],                                    // Class ID: 0x01 Identity Object
      [0x0001, 45],                                    // Instance ID: 0x01
      [0x0001, 47]                                     // Attribute ID
  ];

  writeBuffer(buffer, EIP_HEADER, COMMAND_SPECIFIC_DATA, CIP_FRAME);
  buffer.writeUInt32BE(SESSION_HANDLE, 4);
  return buffer;
};

function writeBuffer(buffer, ...data) {
  data.forEach((arr) => {
    arr.forEach(([value, offset]) => {
      try {
        if (typeof value === 'number') {
          if (value <= 0xFF) {
            buffer.writeUInt8(value, offset);
          } else if (value <= 0xFFFF) {
            buffer.writeUInt16LE(value, offset);
          } else {
            buffer.writeUInt32LE(value, offset);
          };
        } else if (typeof value === 'bigint') {
          buffer.writeBigUInt64LE(value, offset);
        } else {
          throw new Error(`Invalid data type at buffer offset: ${offset}. Expected number or bigint. Received ${typeof(value)}`);
        };
      } catch(error) {
        throw new Error(`Failed to write data to buffer. Offset: ${offset}. ${error.message}`);
      };
    });
  });
  return buffer;
};