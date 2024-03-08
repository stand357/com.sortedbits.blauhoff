import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';
import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { IBaseLogger } from '../../../../helpers/log';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/brand';
import { DeviceModel } from '../../models/device-model';
import { defaultValueConverter } from '../_shared/default-value-converter';

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

    new ModbusRegister(36155, 1, RegisterDataType.UINT16, 1, 'measure_percentage.bat_soc'),
    new ModbusRegister(36156, 1, RegisterDataType.UINT16, 1, 'measure_percentage.bat_soh'),

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
    new ModbusRegister(60003, 1, RegisterDataType.UINT16, 1, 'measure_percentage.max_feedin_limit'),
    new ModbusRegister(60004, 1, RegisterDataType.INT16, 1, 'measure_power.battery_power_ref'),
    new ModbusRegister(60005, 1, RegisterDataType.INT16, 1, 'measure_power.power_ref_inv_limit'),
    new ModbusRegister(60007, 1, RegisterDataType.UINT16, 1, 'measure_xxxtimexxx.vpp_timer'),
    new ModbusRegister(60008, 1, RegisterDataType.UINT16, 1, 'onoff.vpp_timer_enable'), //heeft nog niet de juiste capability
    new ModbusRegister(60009, 1, RegisterDataType.UINT16, 0.01, 'measure_percentage.bat_cap_min'),
];

const spha: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const blauhoffSPHA: DeviceModel = {
    id: 'blauhoff-1',
    brand: Brand.Blauhoff,
    name: 'Blauhoff SPHA',
    description: 'Blauhoff SPHA series of string inverters with MODBUS interface.',
    debug: false,
    definition: spha,
};
