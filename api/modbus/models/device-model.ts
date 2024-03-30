/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusDeviceDefinition } from './modbus-device-registers';
import { Brand } from './enum/brand';

export interface DeviceModel {
    id: string;
    brand: Brand;
    name: string;
    description: string;
    debug: boolean;

    definition: ModbusDeviceDefinition;
}
