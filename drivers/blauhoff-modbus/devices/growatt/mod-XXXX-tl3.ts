import { RegisterCalculation } from '../../../../api/modbus/models/register-calculation';
import { RegisterDataType } from '../../../../api/modbus/models/register-datatype';
import { ModbusRegister } from '../../../../api/modbus/models/modbus-register';
import { ModbusDeviceDefinition } from '../../../../api/modbus/models/modbus-device-registers';

import { mod_tl_registers } from './mod-XXXX-tl';

// eslint-disable-next-line camelcase
export const mod_tl3_registers: ModbusDeviceDefinition = {
    inputRegisters: [
        ...mod_tl_registers.inputRegisters,
        new ModbusRegister(42, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase2', RegisterCalculation.None),
        new ModbusRegister(46, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase3', RegisterCalculation.None),
    ],
    holdingRegisters: mod_tl_registers.holdingRegisters,
    inputRegisterResultConversion: mod_tl_registers.inputRegisterResultConversion,
    holdingRegisterResultConversion: mod_tl_registers.holdingRegisterResultConversion,
};
