/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { IBaseLogger } from '../../../../helpers/log';
import { ModbusRegister } from '../../models/modbus-register';
import { RegisterDataType } from '../../models/register-datatype';

/**
 * Converts the value read from a Modbus register based on the register's data type.
 *
 * @param log - The logger instance.
 * @param readRegisterResult - The result of reading the register.
 * @param register - The Modbus register.
 * @returns The converted value.
 */
export const defaultValueConverter = (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister): any => {
    switch (register.dataType) {
        case RegisterDataType.UINT16:
            return readRegisterResult.buffer.readUInt16BE();
        case RegisterDataType.UINT32:
            return readRegisterResult.buffer.readUInt32BE();
        case RegisterDataType.INT16:
            return readRegisterResult.buffer.readInt16BE();
        case RegisterDataType.INT32:
            return readRegisterResult.buffer.readInt32BE();
        case RegisterDataType.FLOAT32:
            return readRegisterResult.buffer.readFloatBE();
        case RegisterDataType.STRING:
            return readRegisterResult.buffer.toString('utf8');
        default:
            log.error('Unknown data type', register.dataType);
            return undefined;
    }
};
