/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusRTU, ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { IBaseLogger } from '../../../helpers/log';
import { ModbusRegister } from './modbus-register';
import { DeviceAction } from '../helpers/set-modes';

export interface ModbusDeviceDefinition {
    inputRegisterResultConversion: (log: IBaseLogger, buffer: Buffer, register: ModbusRegister) => any;
    holdingRegisterResultConversion: (log: IBaseLogger, buffer: Buffer, register: ModbusRegister) => any;

    inputRegisters: ModbusRegister[];
    holdingRegisters: ModbusRegister[];

    deprecatedCapabilities?: string[];

    actions?: {
        [id in DeviceAction]: (origin: IBaseLogger, args: any, client: ModbusRTU) => Promise<void>;
    };
}
