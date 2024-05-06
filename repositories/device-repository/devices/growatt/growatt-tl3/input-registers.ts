import { RegisterDataType } from '../../../models/enum/register-datatype';
import { ModbusRegister } from '../../../models/modbus-register';
import { inputRegisters as micInputRegisters } from '../growatt-tl/input-registers';

export const inputRegisters: ModbusRegister[] = [
    ...micInputRegisters,
    ModbusRegister.scale('measure_voltage.grid_l2', 42, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.grid_l3', 46, 2, RegisterDataType.UINT16, 0.1),
];
