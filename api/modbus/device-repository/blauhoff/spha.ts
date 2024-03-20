/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
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
    ModbusRegister.default('status_code.run_mode', 36101, 1, RegisterDataType.UINT16),

    ModbusRegister.default('status_code.sys_error_code', 36103, 1, RegisterDataType.UINT16),
    ModbusRegister.default('status_code.sys_bat_error_code', 36104, 1, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_voltage.pv1', 36108, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_current.pv1', 36109, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('measure_voltage.pv2', 36110, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_current.pv2', 36111, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.default('measure_power.pv1', 36112, 1, RegisterDataType.UINT16),
    ModbusRegister.default('measure_power.pv2', 36113, 1, RegisterDataType.UINT16),

    ModbusRegister.default('measure_power.dsp', 36117, 2, RegisterDataType.INT32),
    ModbusRegister.default('measure_power.eps', 36124, 2, RegisterDataType.INT32),
    ModbusRegister.default('measure_power.grid_output', 36131, 2, RegisterDataType.INT32),
    ModbusRegister.default('measure_power.battery', 36138, 2, RegisterDataType.INT32),

    ModbusRegister.scale('measure_voltage.battery', 36151, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.default('measure_percentage.bat_soc', 36155, 1, RegisterDataType.UINT16),
    ModbusRegister.default('measure_percentage.bat_soh', 36156, 1, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_temperature.battery_high', 36161, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_temperature.battery_low', 36163, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('meter_power.battery_total_charge', 36201, 2, RegisterDataType.UINT32, 0.1),
    ModbusRegister.scale('meter_power.battery_total_discharge', 36203, 2, RegisterDataType.UINT32, 0.1),

    ModbusRegister.default('measure_power.pv', 36205, 2, RegisterDataType.INT32),

    ModbusRegister.scale('meter_power.total_to_grid_pv', 36207, 2, RegisterDataType.UINT32, 0.1),
    ModbusRegister.scale('meter_power.total_to_grid', 36209, 2, RegisterDataType.UINT32, 0.1),
    ModbusRegister.scale('meter_power.total_from_grid', 36211, 2, RegisterDataType.UINT32, 0.1),
    ModbusRegister.scale('meter_power.pv', 36213, 2, RegisterDataType.UINT32, 0.1),
];

const holdingRegisters: ModbusRegister[] = [
    ModbusRegister.default('status_code.work_mode', 60001, 1, RegisterDataType.UINT16),
    ModbusRegister.default('measure_percentage.max_feedin_limit', 60003, 1, RegisterDataType.UINT16),
    ModbusRegister.default('measure_power.battery_power_ref', 60004, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.power_ref_inv_limit', 60005, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_xxxtimexxx.vpp_timer', 60007, 1, RegisterDataType.UINT16),
    ModbusRegister.default('onoff.vpp_timer_enable', 60008, 1, RegisterDataType.UINT16), // heeft nog niet de juiste capability
    ModbusRegister.scale('measure_percentage.bat_cap_min', 60009, 1, RegisterDataType.UINT16, 0.01),
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
