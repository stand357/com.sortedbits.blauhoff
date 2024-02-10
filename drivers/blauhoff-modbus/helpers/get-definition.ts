import { ModbusDeviceDefinition } from '../../../api/modbus/models/modbus-device-registers';
import { Brand } from '../models/brand';
import { DeviceModel } from '../models/model';
import { devices } from '../devices/devices';

/**
 * Retrieves the Modbus device definition based on the device type.
 *
 * @param log - The logger instance.
 * @param brand - The type of the device.
 * @returns The Modbus device definition.
 * @throws Error if the device type is unknown.
 */
export const getDeviceModel = (brand: Brand, modelId: string): DeviceModel | undefined => {
    const register = devices.find((model) => model.id === modelId && model.brand === brand);
    return register;
};

export const getModelsForBrand = (brand: Brand): DeviceModel[] => {
    return devices.filter((model) => model.brand === brand);
};

/**
 * Retrieves the Modbus device definition based on the device type.
 *
 * @param log - The logger instance.
 * @param brand - The type of the device.
 * @param modelId - The model of the device.
 * @returns The Modbus device definition.
 * @throws Error if the device type is unknown.
 */
export const getDefinition = (brand: Brand, modelId: string): ModbusDeviceDefinition | undefined => {
    const model = getDeviceModel(brand, modelId);

    if (model) {
        return model.getDefinition();
    }

    return undefined;
};
