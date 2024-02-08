import { RegisterCalculation } from '../../../api/modbus/models/register-calculation';
import { RegisterDataType } from '../../../api/modbus/models/register-datatype';

export interface DeviceModbusRegister {
    /**
     * The input registers of the device. Queried using function code 4.
     */
    inputRegisters: any[][];

    /**
     * The holding registers of the device. Queried using function code 3.
     */
    holdingRegisters: any[][];
}

/**
 * This is the list of registers for the Blauhoff Modbus device.
 *
 * Field 1: Address
 * Field 2: Length
 * Field 3: Data Type
 * Field 4: Scale
 * Field 5: Capability ID
 * Field 6: Calculation that needs to be performed on the value
 * Field 7: Multiplier
 */
const inputRegisters = [
    [0, 2, RegisterDataType.UINT16, 1, 'measure_power.ac', RegisterCalculation.None, 1],
    [6, 2, RegisterDataType.UINT16, 1, 'measure_energy.ac', RegisterCalculation.None, 1],
    [13, 2, RegisterDataType.UINT16, 1, 'measure_energy.power', RegisterCalculation.None, 1],
    // [3000, 2, RegisterDataType.UINT16, 1, 'measure_voltage.pv1', RegisterCalculation.None, 10],
    // [3001, 2, RegisterDataType.UINT16, 1, 'measure_voltage.pv2', RegisterCalculation.None, 10],
    // [3012, 2, RegisterDataType.INT16, 1, 'measure_current.pv1', RegisterCalculation.None, 10],
    // [3013, 2, RegisterDataType.INT16, 1, 'measure_current.pv2', RegisterCalculation.None, 10],
];

const holdingRegisters: any[][] = [];

export const registers: DeviceModbusRegister = {
    inputRegisters,
    holdingRegisters,
};
