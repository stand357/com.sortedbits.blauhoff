import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/brand';
import { DeviceModel } from '../../models/device-model';
import { defaultValueConverter } from '../_shared/default-value-converter';

/**
 * This is the list of registers for the Blauhoff Modbus device.
 *
 * Field 1: Address
 * Field 2: Length
 * Field 3: Data Type
 * Field 4: Scale
 * Field 5: Capability ID
 * Field 6: Calculation that needs to be performed on the value
 */
const inputRegisters = [
    new ModbusRegister(3000, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv1'),
    new ModbusRegister(3001, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv2'),
    new ModbusRegister(3012, 2, RegisterDataType.INT16, 0.01, 'measure_current.pv1'),
    new ModbusRegister(3013, 2, RegisterDataType.INT16, 0.01, 'measure_current.pv2'),
    new ModbusRegister(3024, 2, RegisterDataType.INT16, 1, 'measure_power.pv1'),
    new ModbusRegister(3025, 2, RegisterDataType.INT16, 1, 'measure_power.pv2'),

    new ModbusRegister(3036, 2, RegisterDataType.UINT16, 0.1, 'meter_power.today'),
    new ModbusRegister(3041, 4, RegisterDataType.UINT32, 0.1, 'meter_power'),

    new ModbusRegister(3046, 2, RegisterDataType.UINT16, 0, 'status_code.run_mode'),

    new ModbusRegister(3067, 2, RegisterDataType.UINT16, 0.1, 'measure_temperature.battery_high'),
    new ModbusRegister(3066, 2, RegisterDataType.UINT16, 0.1, 'measure_percentage.bat_soc'),
    new ModbusRegister(3075, 2, RegisterDataType.UINT16, 0.1, 'measure_percentage.bat_soh'),

    new ModbusRegister(3121, 4, RegisterDataType.UINT32, 0.1, 'meter_power.total_to_grid'),
    new ModbusRegister(3114, 4, RegisterDataType.UINT32, 0.1, 'meter_power.total_from_grid'),

    new ModbusRegister(3299, 4, RegisterDataType.UINT32, 0.1, 'meter_power.battery_total_charge'),
    new ModbusRegister(3292, 4, RegisterDataType.UINT32, 0.1, 'meter_power.battery_total_discharge'),

];

const holdingRegisters: ModbusRegister[] = [
];

// eslint-disable-next-line camelcase
const hybridInverter: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const kstarHybridInverter: DeviceModel = {
    id: 'kstar-default',
    brand: Brand.Kstar,
    name: 'Kstar Hybrid Inverter',
    description: 'Kstar Hybrid inverters with MODBUS interface',
    debug: false,
    definition: hybridInverter,
};
