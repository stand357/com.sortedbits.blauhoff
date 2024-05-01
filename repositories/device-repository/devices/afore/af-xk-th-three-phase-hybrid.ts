/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IAPI } from '../../../../api/iapi';
import { IBaseLogger } from '../../../../helpers/log';
import { DeviceRepository } from '../../device-repository';
import { defaultValueConverter } from '../../helpers/default-value-converter';
import { DeviceModel } from '../../models/device-model';
import { AccessMode } from '../../models/enum/access-mode';
import { Brand } from '../../models/enum/brand';
import { RegisterDataType } from '../../models/enum/register-datatype';
import { RegisterType } from '../../models/enum/register-type';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { ModbusRegister } from '../../models/modbus-register';

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

    ModbusRegister.default('measure_power.charge_instructions', 2502, 2, RegisterDataType.INT32, AccessMode.ReadWrite),
];

const writeValueToRegister = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    client.writeValueToRegister(args);
};

const setChargeCommand = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const emsAddress = 2500;
    const commandAddress = 2501;
    const powerAddress = 2502;
    const registerType = RegisterType.Holding;

    const emsRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType.toString(), emsAddress);
    const commandRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType.toString(), commandAddress);
    const powerRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType.toString(), powerAddress);

    if (commandRegister === undefined || powerRegister === undefined || emsRegister === undefined) {
        origin.error('Register not found');
        return;
    }

    const { value, charge_command } = args;

    if (value < -22000 || value > 22000) {
        origin.error('Value out of range');
        return;
    }

    const commandValue = charge_command === 'charge' ? '00aa' : '00bb';
    const buffer = Buffer.from(commandValue, 'hex');

    const powerBuffer = Buffer.alloc(4);
    powerBuffer.writeInt32BE(value);

    origin.log('Setting charge command', buffer, 'and power', powerBuffer);

    try {
        const powerOutput = await client.writeBufferRegister(powerRegister, powerBuffer);
        const commandOutput = await client.writeBufferRegister(commandRegister, buffer);
        const emsModeOutput = await client.writeRegister(emsRegister, 4);

        origin.log('Command and power output', emsModeOutput, commandOutput, powerOutput);
    } catch (error) {
        origin.error('Error writing to register', error);
    }
};

const setEmsMode = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const emsAddress = 2500;
    const registerType = RegisterType.Holding;

    const emsRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType.toString(), emsAddress);

    if (emsRegister === undefined) {
        origin.error('Register not found');
        return;
    }

    const { mode } = args;

    if (mode < 0 || mode > 8) {
        origin.error('Value out of range');
        return;
    }

    try {
        const emsModeOutput = await client.writeRegister(emsRegister, mode);

        origin.log('Command and power output', emsModeOutput);
    } catch (error) {
        origin.error('Error writing to register', error);
    }
};

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
            set_charge_command: setChargeCommand,
            write_value_to_register: writeValueToRegister,
            set_ems_mode: setEmsMode,
        },
    },
};
