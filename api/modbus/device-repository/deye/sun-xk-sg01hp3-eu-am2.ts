import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/brand';
import { DeviceModel } from '../../models/device-model';
import { defaultValueConverter } from '../_shared/default-value-converter';

/**
 * This is the list of registers for the Deye Modbus device.
 *
 * Field 1: Address
 * Field 2: Length
 * Field 3: Data Type
 * Field 4: Scale
 * Field 5: Capability ID
 * Field 6: Calculation that needs to be performed on the value
 */
const inputRegisters: ModbusRegister[] = [
];

const holdingRegisters: ModbusRegister[] = [
];

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const deyeSunXKSG01HP3: DeviceModel = {
    id: 'deye-sun-xk-sg01hp3-eu-am2',
    brand: Brand.Deye,
    name: 'Deye Sun *K SG01HP3 EU AM2 Series',
    description: 'Deye Sun *K SG01HP3 EU AM2 Series with modbus interface',
    debug: true,
    definition: definition,
};
