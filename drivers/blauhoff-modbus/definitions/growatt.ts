import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { RegisterCalculation } from '../../../api/modbus/models/register-calculation';
import { RegisterDataType } from '../../../api/modbus/models/register-datatype';
import { ModbusRegister } from '../../../api/modbus/models/modbus-register';
import { IBaseLogger } from '../../../helpers/log';
import { ModbusDeviceDefinition } from '../../../api/modbus/models/modbus-device-registers';

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
    new ModbusRegister(0, 2, RegisterDataType.UINT16, 1, 'status_code.run_mode', RegisterCalculation.None, 0),
    new ModbusRegister(3, 2, RegisterDataType.UINT16, 1, 'measure_voltage.pv1', RegisterCalculation.None, 0.1),
    new ModbusRegister(7, 2, RegisterDataType.UINT16, 1, 'measure_voltage.pv2', RegisterCalculation.None, 0.1),
    new ModbusRegister(1, 2, RegisterDataType.UINT32, 1, 'measure_power.ac', RegisterCalculation.None, 0.1),
    new ModbusRegister(5, 2, RegisterDataType.UINT32, 1, 'measure_power.pv1', RegisterCalculation.None, 0.1),
    new ModbusRegister(9, 2, RegisterDataType.UINT32, 1, 'measure_power.pv2', RegisterCalculation.None, 0.1),
    new ModbusRegister(35, 2, RegisterDataType.UINT32, 1, 'measure_power.pv', RegisterCalculation.None, 0.1),

    new ModbusRegister(38, 2, RegisterDataType.UINT16, 1, 'measure_voltage.phase1', RegisterCalculation.None, 0.1),
    new ModbusRegister(42, 2, RegisterDataType.UINT16, 1, 'measure_voltage.phase2', RegisterCalculation.None, 0.1),
    new ModbusRegister(46, 2, RegisterDataType.UINT16, 1, 'measure_voltage.phase3', RegisterCalculation.None, 0.1),
    new ModbusRegister(53, 2, RegisterDataType.UINT32, 1, 'meter_power.today', RegisterCalculation.None, 0.1),
    new ModbusRegister(55, 2, RegisterDataType.UINT32, 1, 'meter_power.total', RegisterCalculation.None, 0.1),
];

const holdingRegisters: ModbusRegister[] = [
    new ModbusRegister(23, 5, RegisterDataType.STRING, 1, 'serial', RegisterCalculation.None, 0),
];

const inputRegisterResultConversion = (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister): any => {
    switch (register.dataType) {
        case RegisterDataType.FLOAT32:
            return readRegisterResult.buffer.readFloatBE();
        case RegisterDataType.UINT32:
            return readRegisterResult.buffer.readUInt32BE();
        case RegisterDataType.UINT16:
            return readRegisterResult.buffer.readUInt16BE();
        case RegisterDataType.STRING:
            return readRegisterResult.buffer.toString('utf8');
        default:
            log.error('Unknown data type', register.dataType);
            return undefined;
    }
};

export const growattRegisters: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion,
    holdingRegisterResultConversion: inputRegisterResultConversion,
};
