/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IAPI } from '../../../../api/iapi';
import { readBitBE } from '../../../../helpers/bits';
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

// 0x03
const holdingRegisters: ModbusRegister[] = [
    ModbusRegister.transform('status_text.ac_timing_charge', 206, 2, RegisterDataType.UINT32, (_, buffer, log) => {
        if (readBitBE(buffer, 4) === 1) {
            return 'Enabled';
        }
        return 'Disabled';
    })
        .addTransform('status_text.timing_charge', (_, buffer) => {
            if (readBitBE(buffer, 5) === 1) {
                return 'Enabled';
            }
            return 'Disabled';
        })
        .addTransform('status_text.timing_discharge', (_, buffer) => {
            if (readBitBE(buffer, 6) === 1) {
                return 'Enabled';
            }
            return 'Disabled';
        }),

    ModbusRegister.default('status_code.run_mode', 2500, 1, RegisterDataType.UINT16, AccessMode.ReadWrite).addTransform('status_text.ems_mode', (value) => {
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
    }),

    ModbusRegister.transform('status_text.charge_command', 2501, 1, RegisterDataType.UINT16, (value, buffer, log) => {
        if (buffer.toString('hex') === '00aa') {
            return 'Charge/Discharge';
        } else if (buffer.toString('hex') === '00bb') {
            return 'Paused';
        }
        return 'Unknown';
    }),

    ModbusRegister.default('measure_power.charge_instructions', 2502, 2, RegisterDataType.INT32, AccessMode.ReadWrite),
    ModbusRegister.scale('measure_percentage.acpchgmax', 2504, 1, RegisterDataType.UINT16, 0.1, AccessMode.ReadWrite),
    ModbusRegister.scale('measure_percentage.acsocmaxchg', 2505, 1, RegisterDataType.UINT16, 0.1, AccessMode.ReadWrite),

    ModbusRegister.transform(
        'timeslot.time',
        2509,
        1,
        RegisterDataType.UINT16,
        (value, buffer, log) => {
            log.log('timeslot.time', buffer, buffer.length);
        },
        AccessMode.WriteOnly,
    ),
    ModbusRegister.default('timeslot.time', 2510, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 2511, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 2512, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 1513, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 1514, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 1515, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
    ModbusRegister.default('timeslot.time', 1516, 1, RegisterDataType.UINT16, AccessMode.WriteOnly),
];

const writeValueToRegister = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    client.writeValueToRegister(args);
};

const setChargeCommand = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const emsAddress = 2500;
    const commandAddress = 2501;
    const powerAddress = 2502;
    const registerType = RegisterType.Holding;

    const emsRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, emsAddress);
    const commandRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, commandAddress);
    const powerRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, powerAddress);

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

    const emsRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, emsAddress);

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

const setAcChargingTimeslot = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const timeslotStartAddress = 2509;
    const timeSlotEndAddress = 2510;
    const registerType = RegisterType.Holding;

    const { timeslot, starttime, endtime } = args;
    if (timeslot < 1 || timeslot > 4) {
        origin.error('Value out of range');
        return;
    }

    if (!starttime || !endtime) {
        origin.error('Start or end time not provided');
        return;
    }

    const timeToBuffer = (time: string): Buffer => {
        const [hours, minutes] = time.split(':');
        const buffer = Buffer.from([parseInt(hours), parseInt(minutes)]);
        return buffer;
    };

    const startAddress = timeslotStartAddress + (timeslot - 1) * 2;
    const endAddress = timeSlotEndAddress + (timeslot - 1) * 2;

    const startBuffer = timeToBuffer(starttime);
    const endBuffer = timeToBuffer(endtime);

    const startRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, startAddress);
    const endRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, endAddress);

    if (startRegister === undefined || endRegister === undefined) {
        origin.error('Register not found');
        return;
    }

    try {
        const startOutput = await client.writeBufferRegister(startRegister, startBuffer);
        const endOutput = await client.writeBufferRegister(endRegister, endBuffer);

        origin.log('Start and end time output', startOutput, endOutput);
    } catch (error) {
        origin.error('Error writing to register', error);
    }
};

const setTimingAcChargeOff = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const address = 206;
    const registerType = RegisterType.Holding;

    const register = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), registerType, address);

    if (register === undefined) {
        origin.error('Register not found');
        return;
    }

    try {
        const output = await client.writeBitsToRegister(register, registerType, [0], 4);
        origin.log('Output', output);
    } catch (error) {
        origin.error('Error writing to register', error);
    }
};

const setTimingAcChargeOn = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
    const enabledRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), RegisterType.Holding, 206);
    const acpchgmaxRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), RegisterType.Holding, 2504);
    const acsocmaxchgRegister = DeviceRepository.getRegisterByTypeAndAddress(client.getDeviceModel(), RegisterType.Holding, 2505);

    if (enabledRegister === undefined || acpchgmaxRegister === undefined || acsocmaxchgRegister === undefined) {
        origin.error('Register not found');
        return;
    }

    const { acpchgmax, acsocmaxchg } = args;

    if (acpchgmax < 0 || acpchgmax > 100 || acsocmaxchg < 0 || acsocmaxchg > 100) {
        origin.error('Value out of range');
        return;
    }

    try {
        const output = await client.writeBitsToRegister(enabledRegister, RegisterType.Holding, [1], 4);

        const acpchgmaxOutput = await client.writeRegister(acpchgmaxRegister, acpchgmaxRegister.calculatePayload(acpchgmax, origin));
        const acsocmaxchgOutput = await client.writeRegister(acsocmaxchgRegister, acsocmaxchgRegister.calculatePayload(acsocmaxchg, origin));

        origin.log('Output', output, acpchgmaxOutput, acsocmaxchgOutput);
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
    id: 'af-xk-th-three-phase-hybrid',
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
            set_ac_charging_timeslot: setAcChargingTimeslot,
            set_timing_ac_charge_off: setTimingAcChargeOff,
            set_timing_ac_charge_on: setTimingAcChargeOn,
        },
    },
};
