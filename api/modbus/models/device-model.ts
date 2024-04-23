/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusDeviceDefinition } from './modbus-device-registers';
import { Brand } from './enum/brand';
import { IBaseLogger } from '../../../helpers/log';
import { ModbusAPI } from '../modbus-api';

interface SupportedFlows {
    actions?: {
        [id: string]: (origin: IBaseLogger, args: any, client: ModbusAPI) => Promise<void>;
    };
}

export interface DeviceModel {
    id: string;
    brand: Brand;
    name: string;
    description: string;
    debug: boolean;

    definition: ModbusDeviceDefinition;

    supportedFlows?: SupportedFlows;
}
