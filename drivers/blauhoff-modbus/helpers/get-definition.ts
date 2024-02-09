import { ModbusDeviceDefinition } from '../../../api/modbus/models/modbus-device-registers';
import { IBaseLogger } from '../../../helpers/log';
import { DeviceType } from '../models/device-type';
import { blauhoffRegisters } from '../definitions/blauhoff';
import { growattRegisters } from '../definitions/growatt';

/**
 * Retrieves the Modbus device definition based on the device type.
 *
 * @param log - The logger instance.
 * @param deviceType - The type of the device.
 * @returns The Modbus device definition.
 * @throws Error if the device type is unknown.
 */
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
