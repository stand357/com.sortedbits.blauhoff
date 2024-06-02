import { AccessMode } from '../../../models/enum/access-mode';
import { RegisterDataType } from '../../../models/enum/register-datatype';
import { ModbusRegister } from '../../../models/modbus-register';

export const inputRegisters = [
    ModbusRegister.default('status_code.run_mode', 0, 1, RegisterDataType.UINT8),

    ModbusRegister.scale('measure_voltage.pv1', 3, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 360 }),
    ModbusRegister.scale('measure_voltage.pv2', 7, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 360 }),

    ModbusRegister.scale('measure_power.ac', 1, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly),
    ModbusRegister.scale('measure_power.pv1', 5, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 20000 }),
    ModbusRegister.scale('measure_power.pv2', 9, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 20000 }),
    ModbusRegister.scale('measure_power', 35, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 40000 }),

    ModbusRegister.scale('measure_voltage.grid_l1', 38, 2, RegisterDataType.UINT16, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 300 }),
    ModbusRegister.scale('meter_power.today', 53, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 0, validValueMax: 250 }),
    ModbusRegister.scale('meter_power', 55, 2, RegisterDataType.UINT32, 0.1, AccessMode.ReadOnly, { validValueMin: 1 }),
];
