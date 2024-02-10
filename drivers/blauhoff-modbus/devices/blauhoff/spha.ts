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
 * Field 7: Multiplier
 */
const inputRegisters = [
    new ModbusRegister(36101, 1, RegisterDataType.UINT16, 1, 'status_code.run_mode', RegisterCalculation.None, 1),

    new ModbusRegister(36108, 1, RegisterDataType.UINT16, 1, 'measure_voltage.pv1', RegisterCalculation.None, 0.1),
    new ModbusRegister(36109, 1, RegisterDataType.UINT16, 1, 'measure_current.pv1', RegisterCalculation.None, 0.1),

    new ModbusRegister(36110, 1, RegisterDataType.UINT16, 1, 'measure_voltage.pv2', RegisterCalculation.None, 0.1),
    new ModbusRegister(36111, 1, RegisterDataType.UINT16, 1, 'measure_current.pv2', RegisterCalculation.None, 0.1),

    new ModbusRegister(36112, 1, RegisterDataType.UINT16, 1, 'measure_power.pv1', RegisterCalculation.None, 1),
    new ModbusRegister(36113, 1, RegisterDataType.UINT16, 1, 'measure_power.pv2', RegisterCalculation.None, 1),
    new ModbusRegister(36205, 2, RegisterDataType.UINT16, 1, 'measure_power.pv', RegisterCalculation.None, 1),

    new ModbusRegister(36155, 1, RegisterDataType.UINT16, 1, 'measure_state_of_charge.battery', RegisterCalculation.None, 1),

    new ModbusRegister(36151, 1, RegisterDataType.UINT16, 1, 'measure_voltage.battery', RegisterCalculation.None, 0.1),
];

const holdingRegisters: ModbusRegister[] = [
];

const inputRegisterResultConversion = (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister): any => {
    switch (register.dataType) {
        case RegisterDataType.UINT16:
            return readRegisterResult.buffer.readUInt16BE();
        case RegisterDataType.FLOAT32:
            return readRegisterResult.buffer.readFloatBE();
        case RegisterDataType.UINT32:
            return readRegisterResult.buffer.readUInt32BE();
        default:
            log.error('Unknown data type', register.dataType);
            return undefined;
    }
};

export const blauhoff_spha: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion,
    holdingRegisterResultConversion: inputRegisterResultConversion,
};
