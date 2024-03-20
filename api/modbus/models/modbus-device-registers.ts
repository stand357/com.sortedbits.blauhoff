/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { IBaseLogger } from '../../../helpers/log';
import { ModbusRegister } from './modbus-register';

export interface ModbusDeviceDefinition {
    inputRegisterResultConversion: (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister) => any;
    holdingRegisterResultConversion: (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister) => any;

    inputRegisters: ModbusRegister[];
    holdingRegisters: ModbusRegister[];

    deprecatedCapabilities?: string[];
}
