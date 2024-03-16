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
    new ModbusRegister(500, 1, RegisterDataType.UINT16, 0, 'status_code.run_mode'),
    new ModbusRegister(586, 1, RegisterDataType.UINT16, 0.1, 'measure_temperature.battery'),
    new ModbusRegister(588, 1, RegisterDataType.UINT16, 0.1, 'measure_percentage.bat_soc'),
    new ModbusRegister(590, 1, RegisterDataType.UINT16, 0.1, 'measure_power.eps'),

    new ModbusRegister(598, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.l1'),
    new ModbusRegister(599, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.l2'),
    new ModbusRegister(600, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.l3'),
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
