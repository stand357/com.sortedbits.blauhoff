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
    new ModbusRegister(0, 2, RegisterDataType.FLOAT32, 1, 'measure_voltage.ac', RegisterCalculation.None, 1),
    new ModbusRegister(6, 2, RegisterDataType.FLOAT32, 1, 'measure_current.ac', RegisterCalculation.None, 1),
    new ModbusRegister(12, 2, RegisterDataType.FLOAT32, 1, 'measure_power.ac', RegisterCalculation.None, 1),
    new ModbusRegister(18, 2, RegisterDataType.FLOAT32, 1, 'measure_voltamperage.ac', RegisterCalculation.None, 1),
    new ModbusRegister(70, 2, RegisterDataType.FLOAT32, 1, 'measure_frequence.ac', RegisterCalculation.None, 1),
];

const holdingRegisters: ModbusRegister[] = [
    new ModbusRegister(64512, 2, RegisterDataType.UINT32, 1, 'serial', RegisterCalculation.None, 1),
    // new ModbusRegister(64515, 1, RegisterDataType.UINT32, 1, 'version.ems', RegisterCalculation.None, 1),
];

const inputRegisterResultConversion = (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister): any => {
    switch (register.dataType) {
        case RegisterDataType.FLOAT32:
            return readRegisterResult.buffer.readFloatBE();
        case RegisterDataType.UINT32:
            return readRegisterResult.buffer.readUInt32BE();
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
