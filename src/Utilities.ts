import { Buffer, crypto } from './lib';

const ID_LENGTH = 24;

export class Utilities {

  static writeBuffer(buffer: Buffer, ...data: Array<Array<[number | bigint, number]>>): Buffer {
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
            }
          } else if (typeof value === 'bigint') {
            buffer.writeBigUInt64LE(value, offset);
          } else {
            throw new Error(`Invalid data type at buffer offset: ${offset}. Expected number or bigint. Received ${typeof value}`);
          };
        } catch (error: any) {
          throw new Error(`Failed to write data to buffer. Offset: ${offset}. ${error.message}`);
        };
      });
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