import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
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
    new ModbusRegister(36101, 1, RegisterDataType.UINT16, 1, 'status_code.run_mode'),

    new ModbusRegister(36103, 1, RegisterDataType.UINT16, 1, 'status_code.sys_error_code'),
    new ModbusRegister(36104, 1, RegisterDataType.UINT16, 1, 'status_code.sys_bat_error_code'),

    new ModbusRegister(36108, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv1'),
    new ModbusRegister(36109, 1, RegisterDataType.UINT16, 0.1, 'measure_current.pv1'),

    new ModbusRegister(36110, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.pv2'),
    new ModbusRegister(36111, 1, RegisterDataType.UINT16, 0.1, 'measure_current.pv2'),

    new ModbusRegister(36112, 1, RegisterDataType.UINT16, 1, 'measure_power.pv1'),
    new ModbusRegister(36113, 1, RegisterDataType.UINT16, 1, 'measure_power.pv2'),

    new ModbusRegister(36117, 2, RegisterDataType.INT32, 1, 'measure_power.dsp'),
    new ModbusRegister(36124, 2, RegisterDataType.INT32, 1, 'measure_power.eps'),
    new ModbusRegister(36131, 2, RegisterDataType.INT32, 1, 'measure_power.grid_output'),
    new ModbusRegister(36138, 2, RegisterDataType.INT32, 1, 'measure_power.battery'),

    new ModbusRegister(36151, 1, RegisterDataType.UINT16, 0.1, 'measure_voltage.battery'),

    new ModbusRegister(36155, 1, RegisterDataType.UINT16, 1, 'measure_state_of_charge.bat_soc'),
    new ModbusRegister(36156, 1, RegisterDataType.UINT16, 1, 'measure_state_of_charge.bat_soh'),

    new ModbusRegister(36161, 1, RegisterDataType.UINT16, 0.1, 'measure_temperature.battery_high'),
    new ModbusRegister(36163, 1, RegisterDataType.UINT16, 0.1, 'measure_temperature.battery_low'),

    new ModbusRegister(36201, 2, RegisterDataType.UINT32, 0.1, 'meter_power.battery_total_charge'),
    new ModbusRegister(36203, 2, RegisterDataType.UINT32, 0.1, 'meter_power.battery_total_discharge'),

    new ModbusRegister(36205, 2, RegisterDataType.INT32, 1, 'measure_power.pv'),

    new ModbusRegister(36207, 2, RegisterDataType.UINT32, 0.1, 'meter_power.total_to_grid_pv'),
    new ModbusRegister(36209, 2, RegisterDataType.UINT32, 0.1, 'meter_power.total_to_grid'),
    new ModbusRegister(36211, 2, RegisterDataType.UINT32, 0.1, 'meter_power.total_from_grid'),
    new ModbusRegister(36213, 2, RegisterDataType.UINT32, 0.1, 'meter_power.pv'),
];

const holdingRegisters: ModbusRegister[] = [
    new ModbusRegister(60001, 1, RegisterDataType.UINT16, 0.1, 'status_code.work_mode'),
];

const inputRegisterResultConversion = (log: IBaseLogger, readRegisterResult: ReadRegisterResult, register: ModbusRegister): any => {
    switch (register.dataType) {
        case RegisterDataType.UINT16:
            return readRegisterResult.buffer.readUInt16BE();
        case RegisterDataType.FLOAT32:
            return readRegisterResult.buffer.readFloatBE();
        case RegisterDataType.UINT32:
            return readRegisterResult.buffer.readUInt32BE();
        case RegisterDataType.INT32:
            return readRegisterResult.buffer.readInt32BE();

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
