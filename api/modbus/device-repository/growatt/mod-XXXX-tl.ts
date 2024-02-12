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
    new ModbusRegister(0, 2, RegisterDataType.UINT16, 0, 'status_code.run_mode'),
    new ModbusRegister(3, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv1'),
    new ModbusRegister(7, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv2'),
    new ModbusRegister(1, 2, RegisterDataType.UINT32, 0.1, 'measure_power.ac'),
    new ModbusRegister(5, 2, RegisterDataType.UINT32, 0.1, 'measure_power.pv1'),
    new ModbusRegister(9, 2, RegisterDataType.UINT32, 0.1, 'measure_power.pv2'),
    new ModbusRegister(35, 2, RegisterDataType.UINT32, 0.1, 'measure_power'),

    new ModbusRegister(38, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase1'),
    new ModbusRegister(53, 2, RegisterDataType.UINT32, 0.1, 'meter_power.today'),
    new ModbusRegister(55, 2, RegisterDataType.UINT32, 0.1, 'meter_power'),
];

const holdingRegisters: ModbusRegister[] = [
    new ModbusRegister(23, 5, RegisterDataType.STRING, 0, 'serial'),
];

// eslint-disable-next-line camelcase
export const mod_tl_registers: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const growattTL: DeviceModel = {
    id: 'growatt-tl',
    brand: Brand.Growatt,
    name: 'Growatt 1PH MIC TL-X series',
    description: 'Single phase Growatt string inverters with MODBUS interface.',
    debug: true,
    definition: mod_tl_registers,
};
