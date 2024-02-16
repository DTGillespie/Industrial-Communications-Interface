"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
const lib_1 = require("./lib");
const ID_LENGTH = 24;
class Utilities {
    static writeBuffer(buffer, ...data) {
        data.forEach((arr) => {
            arr.forEach(([value, offset]) => {
                try {
                    if (typeof value === 'number') {
                        if (value <= 0xFF) {
                            buffer.writeUInt8(value, offset);
                        }
                        else if (value <= 0xFFFF) {
                            buffer.writeUInt16LE(value, offset);
                        }
                        else {
                            buffer.writeUInt32LE(value, offset);
                        }
                    }
                    else if (typeof value === 'bigint') {
                        buffer.writeBigUInt64LE(value, offset);
                    }
                    else {
                        throw new Error(`Invalid data type at buffer offset: ${offset}. Expected number or bigint. Received ${typeof value}`);
                    }
                    ;
                }
                catch (error) {
                    throw new Error(`Failed to write data to buffer. Offset: ${offset}. ${error.message}`);
                }
                ;
            });
        });
        return buffer;
    }
    ;
    static makeHashId(...input) {
        return generateSHA256Hash(input.join(''));
    }
    ;
    static makeUniqueId() {
        const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < ID_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
            id += alphanumericChars.charAt(randomIndex);
        }
        const timestamp = new Date().getTime();
        id += timestamp.toString();
        return id;
    }
    ;
}
exports.Utilities = Utilities;
;
function generateSHA256Hash(input) {
    const hash = lib_1.crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}
;
