/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { DeviceModel } from '../../models/device/device-model';
import { Brand } from '../../models/enum/brand';
import { RegisterDataType } from '../../models/enum/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
/*
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
*/

const inputRegisters = [
    ModbusRegister.scale('measure_voltage.l1', 507, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.l2', 508, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.l3', 509, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.transform('status_text.battery', 2000, 1, RegisterDataType.UINT16, (value) => {
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
    ModbusRegister.scale('measure_temperature.battery1', 2001, 1, RegisterDataType.INT16, 0.1),
    ModbusRegister.default('measure_percentage.bat_soc', 2002, 1, RegisterDataType.UINT16),
    ModbusRegister.scale('measure_voltage.battery', 2004, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.default('status_code.run_mode', 2500, 2, RegisterDataType.UINT16),
];

export const device = new DeviceModel(
    'afore-hybrid-inverter',
    Brand.Afore,
    'Afore AF XK-TH Three Phase Hybrid Inverter',
    'Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface',
    true,
).setInputRegisters(inputRegisters);
