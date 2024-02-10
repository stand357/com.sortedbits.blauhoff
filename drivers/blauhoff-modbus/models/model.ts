import { ModbusDeviceDefinition } from '../../../api/modbus/models/modbus-device-registers';
import { Brand } from './brand';

export interface DeviceModel {
    id: string;
    brand: Brand;
    name: string;
    description: string;

    getDefinition: () => ModbusDeviceDefinition;
}
