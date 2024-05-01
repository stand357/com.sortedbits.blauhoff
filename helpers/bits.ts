import { IBaseLogger } from './log';

export const readBit = (buffer: Buffer, byteIndex: number, bitIndex: number): number => {
    return (buffer[byteIndex] >> (7 - bitIndex)) & 1;
};

export const writeBitsToBuffer = (buffer: Buffer, byteIndex: number, bits: number[], startBitIndex: number = 0): Buffer => {
    const result = Buffer.from(buffer);

    let byte = result[byteIndex];

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 1) {
            byte = byte | (1 << (i + startBitIndex));
        } else if (bits[i] === 0) {
            byte = byte & ~(1 << (i + startBitIndex));
        }
    }

    result[byteIndex] = byte;

    return result;
};

export const logBits = (origin: IBaseLogger, buffer: Buffer, bytes: number): void => {
    for (let i = 0; i < bytes; i++) {
        let outputBits = '';
        for (let j = 0; j < 8; j++) {
            const bitValue = readBit(buffer, i, j);
            outputBits += bitValue + ' ';
        }
        origin.log('Byte', i, 'bits', outputBits);
    }
};
