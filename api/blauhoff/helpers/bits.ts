import { IBaseLogger } from '../../../helpers/log';

export const readBit = (buffer: Buffer, byteIndex: number, bitIndex: number): number => {
    return (buffer[byteIndex] >> (7 - bitIndex)) & 1;
};

export const writeBitsToBuffer = (buffer: Buffer, byteIndex: number, bits: number[]): Buffer => {
    const result = Buffer.from(buffer);

    let byte = result[byteIndex];

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 1) {
            byte = byte | (1 << i);
        } else if (bits[i] === 0) {
            byte = byte & ~(1 << i);
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
