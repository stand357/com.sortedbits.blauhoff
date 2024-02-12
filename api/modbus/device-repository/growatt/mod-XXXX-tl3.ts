import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';

import { mod_tl_registers } from './mod-XXXX-tl';
import { DeviceModel } from '../../models/device-model';
import { Brand } from '../../models/brand';

// eslint-disable-next-line camelcase
const mod_tl3_registers: ModbusDeviceDefinition = {
    inputRegisters: [
        ...mod_tl_registers.inputRegisters,
        new ModbusRegister(42, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase2'),
        new ModbusRegister(46, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase3'),
    ],
    holdingRegisters: mod_tl_registers.holdingRegisters,
    inputRegisterResultConversion: mod_tl_registers.inputRegisterResultConversion,
    holdingRegisterResultConversion: mod_tl_registers.holdingRegisterResultConversion,
};

export const growattTL3: DeviceModel = {
    id: 'growatt-tl3',
    brand: Brand.Growatt,
    name: 'Growatt 3PH MOD TL3-X series',
    description: 'Three phase Growatt string inverters with MODBUS interface.',
    debug: true,
    definition: mod_tl3_registers,
};
