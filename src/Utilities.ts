import { Buffer } from 'node:buffer';
import * as crypto from 'node:crypto';

const ID_LENGTH = 24;

export class Utilities {

  static numberToUintArray(...args: number[]): Uint8Array {
    const typeMap = new Map<string, (value: number, size: number) => Uint8Array>([
      ['number', (value, size) => {
        const buffer = new ArrayBuffer(size);
        const view   = new DataView(buffer);
        switch(size) {
          case 1: view.setUint8     (0, value); break;
          case 2: view.setUint16    (0, value); break;
          case 4: view.setUint32    (0, value); break;
          case 8: view.setBigUint64 (0, BigInt(value)); break;
          default: throw new Error("Unsupported number size");
        };
        return new Uint8Array(buffer);
      }]
    ]);

    const conversionFunc = typeMap.get(typeof args[0]);
    if (!conversionFunc) throw new Error(`Invalid data type: ${args[0] !== undefined && args[0] !== null ? "0x" : null}${args[0].toString(16)}. Expected number of bigint. Received ${typeof args[0]}`); 
    try {
      return conversionFunc(args[0], args[1]);
    } catch(error: any) {
      throw new Error(`Failed to convert value to Uint8Array. Value: ${args[0] !== undefined && args[0] !== null ? "0x" : null}${args[0].toString(16)}, Size (Bytes): ${args[1]}. ${error.message}`);
    };
  };

  static writeBuffer(littleEndian: boolean, ...data: Array<Uint8Array>): Buffer {
    const typeMap = new Map<string, (value: number | bigint, offset: number, littleEndian: boolean) => void>([
      ['number', (value, offset, littleEndian) => {
        if (!littleEndian) { /* Byte order is inverted by the typed-arrays, so keep this flipped. */
          if (value <= 0xFF) {
            buffer.writeUInt8(value as number, offset);
          } else if (value <= 0xFFFF) {
            buffer.writeUInt16LE(value as number, offset);
          } else {
            buffer.writeUInt32LE(value as number, offset);
          };
        } else {
          if (value <= 0xFF) {
            buffer.writeUInt8(value as number, offset);
          } else if (value <= 0xFFFF) {
            buffer.writeUInt16BE(value as number, offset);
          } else {
            buffer.writeUInt32BE(value as number, offset);
          };
        };
      }],
      ['bigint', (value, offset) => {
        if (littleEndian) {
          buffer.writeBigInt64LE(value as bigint, offset);
        } else {
          buffer.writeBigInt64BE(value as bigint, offset);
        };
      }]
    ]);

    let bufferSize = 0;
    data.forEach((arr) => {
      bufferSize += arr.length;
    });

    const buffer = Buffer.alloc(bufferSize);
    let offset = 0;
    data.forEach((byteArray) => {
      const length = byteArray.length;
      let value    = null;

      switch(length) {
        case 1: value = byteArray[0]; break;
        case 2: value = byteArray[0] | (byteArray[1] << 8); break;
        case 4: value = (byteArray[0]) | (byteArray[1] << 8) | (byteArray[2] << 16) | (byteArray[3] << 24); break; 
        case 8: value = (byteArray[0]) | (byteArray[1] << 8) | (byteArray[2] << 16) | (byteArray[3] << 24)
                      | (byteArray[4] << 32) | (byteArray[5] << 40) | (byteArray[6] << 48) | (byteArray[7] << 56); break;  
      };


      const writeFunc = typeMap.get(typeof value);
      if (!writeFunc) throw new Error(`Invalid data type at buffer offset: ${offset}. Expected number of bigint. Received ${typeof value}`);
      try {
        writeFunc(value!, offset, littleEndian);
        offset += length;
      } catch(error: any) {
        throw new Error(`Failed to write data to buffer. Offset: ${offset}. ${error.message}`);
      };
    });
    return buffer;

  };

  static makeHashId(...input: string[]): string {
    return generateSHA256Hash(input.join(''));
  };

  static makeUniqueId(): string {
    const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < ID_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
      id += alphanumericChars.charAt(randomIndex);
    }

    const timestamp = new Date().getTime();
    id += timestamp.toString();

    return id;
  };
};

function generateSHA256Hash(input: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
};