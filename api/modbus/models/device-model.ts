import { ModbusDeviceDefinition } from './modbus-device-registers';
import { Brand } from './brand';

export interface DeviceModel {
    id: string;
    brand: Brand;
    name: string;
    description: string;
    debug: boolean;

    definition: ModbusDeviceDefinition;
}
