import { ModbusDeviceDefinition } from '../../../api/modbus/models/modbus-device-registers';
import { IBaseLogger } from '../../../helpers/log';
import { blauhoffRegisters } from './blauhoff';
import { growattRegisters } from './growatt';

export enum DeviceType {
    Blauhoff = 'blauhoff',
    Growatt = 'growatt',
    Deye = 'deye',
    Kstar = 'kstar'
}

export const getDefinition = (log: IBaseLogger, deviceType: DeviceType): ModbusDeviceDefinition => {
    switch (deviceType) {
        case DeviceType.Blauhoff:
            return blauhoffRegisters;
        case DeviceType.Growatt:
            return growattRegisters;
        default:
            log.error('Unknown device type', deviceType);
            throw new Error('Unknown device type');
    }
};
