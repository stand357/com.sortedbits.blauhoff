import { IBaseLogger } from '../../../helpers/log';
import { ModbusRegister } from '../../modbus/models/modbus-register';

export const parseResponse = (log: IBaseLogger, response: Buffer): Array<number> => {
    const length = response.readUInt8(2);

    log.log('parseResponse, length', length);

    const result = [];

    for (let i = 0; i < length; i += 2) {
        const value = response.readUInt16BE(i + 3);
        log.log('parseResponse, value', value);
        result.push(value);
    }

    return result;
};

export const parseRegistersFromResponse = async (
    log: IBaseLogger,
    registers: ModbusRegister[],
    conversion: (log: IBaseLogger, buffer: Buffer, register: ModbusRegister) => any,
    response: Buffer,
    onDataReceived?: (value: any, register: ModbusRegister) => Promise<void>,
): Promise<void> => {
    const length = response.readUInt8(2);

    log.log('Response length', length);

    let startOffset = 3;

    for (const register of registers) {
        const end = startOffset + register.length * 2;
        const valueBuffer = registers.length > 1 ? response.subarray(startOffset, end) : response;

        const value = conversion(log, valueBuffer, register);

        if (onDataReceived) {
            await onDataReceived(value, register);
        }

        startOffset = end;
    }
};
