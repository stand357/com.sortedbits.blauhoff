/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/brand';
import { defaultValueConverter } from '../_shared/default-value-converter';
import { DeviceModel } from '../../models/device-model';
import { RegisterDataType } from '../../models/register-datatype';

const inputRegisters: ModbusRegister[] = [
];

const holdingRegisters: ModbusRegister[] = [
    ModbusRegister.default('status_code.run_mode', 500, 1, RegisterDataType.UINT16),
    ModbusRegister.default('serial', 3, 5, RegisterDataType.STRING),
    ModbusRegister.default('status_code.modbus_protocol', 2, 1, RegisterDataType.UINT16),

    ModbusRegister.transform('status_code.run_mode_name', 500, 1, RegisterDataType.UINT16, (value) => {
        switch (value) {
            case 0:
                return 'Standby';
            case 1:
                return 'Self-check';
            case 2:
                return 'Normal';
            case 3:
                return 'Alarm';
            case 4:
                return 'Fault';
            default:
                return 'In activation';
        }
    }),

    ModbusRegister.default('measure_power.pv1', 672, 1, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_voltage.pv1', 676, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_current.pv1', 677, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.default('measure_power.pv2', 673, 1, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_voltage.pv2', 678, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_current.pv2', 679, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('meter_power.pv', 534, 2, RegisterDataType.UINT16, 0.1),

    ModbusRegister.default('measure_power.total_to_grid', 625, 1, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_voltage.phase1', 598, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.phase2', 599, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.phase3', 600, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.transform('measure_temperature.dc', 540, 1, RegisterDataType.UINT16, (value) => {
        return (value * 0.1) - 1000;
    }),

    ModbusRegister.scale('meter_power.battery_total_charge', 516, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('meter_power.battery_total_discharge', 518, 2, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('measure_power.load', 653, 1, RegisterDataType.INT16, 0),
];

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const deyeSunXKSG01HP3: DeviceModel = {
    id: 'deye-sun-xk-sg01hp3-eu-am2',
    brand: Brand.Deye,
    name: 'Deye Sun *K SG01HP3 EU AM2 Series',
    description: 'Deye Sun *K SG01HP3 EU AM2 Series with modbus interface',
    debug: true,
    definition,
};
