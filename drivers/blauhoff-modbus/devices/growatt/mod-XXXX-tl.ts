import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { RegisterCalculation } from '../../../../api/modbus/models/register-calculation';
import { RegisterDataType } from '../../../../api/modbus/models/register-datatype';
import { ModbusRegister } from '../../../../api/modbus/models/modbus-register';
import { IBaseLogger } from '../../../../helpers/log';
import { ModbusDeviceDefinition } from '../../../../api/modbus/models/modbus-device-registers';

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
    new ModbusRegister(0, 2, RegisterDataType.UINT16, 0, 'status_code.run_mode', RegisterCalculation.None),
    new ModbusRegister(3, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv1', RegisterCalculation.None),
    new ModbusRegister(7, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv2', RegisterCalculation.None),
    new ModbusRegister(1, 2, RegisterDataType.UINT32, 0.1, 'measure_power.ac', RegisterCalculation.None),
    new ModbusRegister(5, 2, RegisterDataType.UINT32, 0.1, 'measure_power.pv1', RegisterCalculation.None),
    new ModbusRegister(9, 2, RegisterDataType.UINT32, 0.1, 'measure_power.pv2', RegisterCalculation.None),
    new ModbusRegister(35, 2, RegisterDataType.UINT32, 0.1, 'measure_power', RegisterCalculation.None),

    new ModbusRegister(38, 2, RegisterDataType.UINT16, 0.1, 'measure_voltage.phase1', RegisterCalculation.None),
    new ModbusRegister(53, 2, RegisterDataType.UINT32, 0.1, 'meter_power.today', RegisterCalculation.None),
    new ModbusRegister(55, 2, RegisterDataType.UINT32, 0.1, 'meter_power', RegisterCalculation.None),
];

const holdingRegisters: ModbusRegister[] = [
    new ModbusRegister(23, 5, RegisterDataType.STRING, 0, 'serial', RegisterCalculation.None),
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

// eslint-disable-next-line camelcase
export const mod_tl_registers: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion,
    holdingRegisterResultConversion: inputRegisterResultConversion,
};
