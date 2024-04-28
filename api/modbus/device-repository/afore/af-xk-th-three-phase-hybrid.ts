/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IBaseLogger } from '../../../../helpers/log';
import { ModbusAPI } from '../../modbus-api';
import { DeviceModel } from '../../models/device-model';
import { Brand } from '../../models/enum/brand';
import { RegisterDataType } from '../../models/enum/register-datatype';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { ModbusRegister } from '../../models/modbus-register';
import { defaultValueConverter } from '../_shared/default-value-converter';

const inputRegisters: ModbusRegister[] = [
    //    ModbusRegister.default('serial', 0, 2, RegisterDataType.UINT16),

    //settings
    //    ModbusRegister.default('serial', 41, 8, RegisterDataType.STRING),
    //    ModbusRegister.default('measure_power.grid_l1', 516, 4, RegisterDataType.UINT32),
    //ModbusRegister.default('serial', 0, 2, RegisterDataType.UINT16),
    //ModbusRegister.default('status_code.run_mode', 2500, 2, RegisterDataType.UINT16),
    /*
    ModbusRegister.transform('status_text.run_mode', 2500, 2, RegisterDataType.UINT16, (value) => {
        if (value === 0) {
            return 'initial power-up';
        } else if (value === 1) {
            return 'standby 1';
        } else if (value === 2) {
            return 'standby 2';
        } else if (value === 3) {
            return 'run grid connected';
        } else if (value === 4) {
            return 'run grid disconnected';
        } else if (value === 5) {
            return 'run generator';
        } else if (value === 6) {
            return 'switch from on grid connected to off grid';
        } else if (value === 7) {
            return 'switch from off grid connected to on grid';
        } else if (value === 8) {
            return 'power-down processing';
        } else if (value === 9) {
            return 'turn off';
        } else if (value === 10) {
            return 'error';
        } else if (value === 11) {
            return 'update';
        } else if (value === 12) {
            return 'aging';
        } else if (value === 13) {
            return 'open loop';
        } else if (value === 14) {
            return 'sampling calibration';
        } else {
            return 'Unknown';
        }
    }),
*/
    //meters
    //ModbusRegister.scale('meter_power.today', 1000, 2, RegisterDataType.UINT16, 0.1),
    /*
    ModbusRegister.scale('meter_power.daily_from_grid', 1003, 2, RegisterDataType.UINT16, 0.1), // day gridbuy
    ModbusRegister.scale('meter_power.daily_to_grid', 1002, 2, RegisterDataType.UINT16, 0.1), // day gridsell
    //ModbusRegister.scale('meter_power_total_from_inverter', 1014, 4, RegisterDataType.UINT32, 0.1),
    //ModbusRegister.scale('meter_power_total_to_inverter', 1016, 4, RegisterDataType.UINT32, 0.1),
    ModbusRegister.scale('meter_power_total_to_grid', 1018, 4, RegisterDataType.UINT32, 0.1), // total gridsell
    ModbusRegister.scale('meter_power_total_from_grid', 1020, 4, RegisterDataType.UINT32, 0.1), // total gridbuy
    ModbusRegister.scale('meter_power_total_to_load', 1022, 4, RegisterDataType.UINT32, 0.1), // total consumption
*/
    //pv
    //  ModbusRegister.scale('measure_power.pv', 553, 4, RegisterDataType.UINT32, 0.1),

    //ModbusRegister.scale('measure_voltage.pv1', 555, 2, RegisterDataType.UINT16, 0.1),
    //    ModbusRegister.scale('measure_voltage.pv2', 558, 2, RegisterDataType.UINT16, 0.1),

    //    ModbusRegister.scale('measure_power.pv1', 557, 2, RegisterDataType.UINT16, 0.1),
    //    ModbusRegister.scale('measure_power.pv2', 560, 2, RegisterDataType.UINT16, 0.1),

    //grid

    //    ModbusRegister.default('measure_power.grid', 522, 4, RegisterDataType.UINT32),
    /*
    ModbusRegister.default('measure_power.grid_l1', 516, 2, RegisterDataType.UINT32),
    ModbusRegister.default('measure_power.grid_l2', 518, 2, RegisterDataType.UINT32),
    ModbusRegister.default('measure_power.grid_l3', 520, 2, RegisterDataType.UINT32),
    */
    ModbusRegister.scale('measure_voltage.l1', 507, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.l2', 508, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.l3', 509, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.transform('status_text.battery', 2000, 2, RegisterDataType.UINT16, (value) => {
        switch (value) {
            case 1:
                return 'No battery';
            case 2:
                return 'Sleeping';
            case 3:
                return 'Start';
            case 4:
                return 'Charging';
            case 5:
                return 'Discharging';
            case 6:
                return 'Off';
            default:
                return 'Unknown';
        }
    }),
    ModbusRegister.default('measure_percentage.bat_soc', 2002, 2, RegisterDataType.UINT16),
];

const setMaxSolarPower = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {
    const { value } = args;

    // Hier zouden we de waardes moeten wegschrijven
};
const setSolarSell = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {
    const { enabled } = args;

    // Hier zouden we de waardes moeten wegschrijven
};

const writeValueToRegister = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {
    client.writeValueToRegister(args);
};

const setEnergyPattern = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {
    const { value } = args;
};

const setGridPeakShavingOn = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {
    const { value } = args;
};

const setGridPeakShavingOff = async (origin: IBaseLogger, args: any, client: ModbusAPI): Promise<void> => {};

const holdingRegisters: ModbusRegister[] = [];

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
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
