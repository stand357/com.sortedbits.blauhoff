/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IAPI } from '../../../api/iapi';
import { IBaseLogger } from '../../../helpers/log';
import { defaultValueConverter } from '../helpers/default-value-converter';
import { DeviceModel } from '../models/device-model';
import { AccessMode } from '../models/enum/access-mode';
import { Brand } from '../models/enum/brand';
import { RegisterDataType } from '../models/enum/register-datatype';
import { ModbusDeviceDefinition } from '../models/modbus-device-registers';
import { ModbusRegister } from '../models/modbus-register';

const inputRegisters: ModbusRegister[] = [
    ModbusRegister.default('status_text.inverter_name', 0, 6, RegisterDataType.STRING),
    ModbusRegister.default('status_text.hard_name', 11, 4, RegisterDataType.STRING),
    ModbusRegister.default('measure_power.grid_active_power', 535, 2, RegisterDataType.INT32), // P1 waarde / Grid in app
    ModbusRegister.default('measure_power.grid_total_load', 547, 2, RegisterDataType.INT32), // Consumption in app

    ModbusRegister.transform('status_text.battery_state', 2000, 1, RegisterDataType.UINT16, (value) => {
        switch (value) {
            case 0:
                return 'No battery';
            case 1:
                return 'Fault';
            case 2:
                return 'Sleep';
            case 3:
                return 'Start';
            case 4:
                return 'Charging';
            case 5:
                return 'Discharging';
            case 6:
                return 'Off';
            case 7:
                return 'Wake up';
            default:
                return 'Unknown';
        }
    }),
    ModbusRegister.default('measure_percentage.bat_soc', 2002, 2, RegisterDataType.UINT16), // Battery SOC
    ModbusRegister.default('measure_power.battery', 2007, 2, RegisterDataType.INT32), // Battery charging/discharging power

    ModbusRegister.default('status_code.running_state', 2500, 1, RegisterDataType.UINT16, AccessMode.ReadOnly),

    ModbusRegister.scale('meter_power.total_battery_charge', 2011, 2, RegisterDataType.UINT32, 0.1), // Total battery charging capacity
    ModbusRegister.scale('meter_power.total_battery_discharge', 2013, 2, RegisterDataType.UINT32, 0.1),
];

const holdingRegisters: ModbusRegister[] = [
    ModbusRegister.default('status_code.run_mode', 2500, 1, RegisterDataType.UINT16, AccessMode.ReadWrite),

    ModbusRegister.transform(
        'status_text.ems_mode',
        2500,
        1,
        RegisterDataType.UINT16,
        (value) => {
            switch (value) {
                case 0:
                    return 'Self-use';
                case 1:
                    return 'Charging priority';
                case 2:
                    return 'Priority in selling electricity';
                case 3:
                    return 'Battery maintenance';
                case 4:
                    return 'Command mode';
                case 5:
                    return 'External EMS';
                case 6:
                    return 'Peak Shaving Mode';
                case 7:
                    return 'Imbalance compensation';
                case 8:
                    return 'Q compensation mode';
                default:
                    return 'Unknown';
            }
        },
        AccessMode.ReadWrite,
    ),

    ModbusRegister.transform('status_text.charge_command', 2501, 1, RegisterDataType.UINT16, (value, buffer, log) => {
        if (buffer.toString('hex') === '00aa') {
            return 'Charge/Discharge';
        } else if (buffer.toString('hex') === '00bb') {
            return 'Paused';
        }
        return 'Unknown';
    }),
];

const setMaxSolarPower = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const { value } = args;

    // Hier zouden we de waardes moeten wegschrijven
};
const setSolarSell = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const { enabled } = args;

    // Hier zouden we de waardes moeten wegschrijven
};

const writeValueToRegister = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    client.writeValueToRegister(args);
};

const setEnergyPattern = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const { value } = args;
};

const setGridPeakShavingOn = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const { value } = args;
};

const setGridPeakShavingOff = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {};

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
    deprecatedCapabilities: ['status_text.batter_state'],
};

export const aforeAFXKTH: DeviceModel = {
    id: 'afore-hybrid-inverter',
    brand: Brand.Afore,
    name: 'Afore AF XK-TH Three Phase Hybrid Inverter',
    description: 'Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface',
    debug: true,
    definition,
    supportedFlows: {
        actions: {
            set_max_solar_power: setMaxSolarPower,
            set_solar_sell: setSolarSell,
            write_value_to_register: writeValueToRegister,
            set_energy_pattern: setEnergyPattern,
            set_grid_peak_shaving_on: setGridPeakShavingOn,
            set_grid_peak_shaving_off: setGridPeakShavingOff,
        },
    },
};
