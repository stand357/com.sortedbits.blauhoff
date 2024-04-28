/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IBaseLogger } from '../../../../helpers/log';
import { ModbusRegister } from '../modbus-register';

export interface ModbusDeviceDefinition {
    resultConverter: (log: IBaseLogger, buffer: Buffer, register: ModbusRegister) => any;

    inputRegisters: ModbusRegister[];
    holdingRegisters: ModbusRegister[];

    deprecatedCapabilities?: string[];
}
