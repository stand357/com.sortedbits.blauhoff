/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IAPI } from '../../../../../api/iapi';
import { IBaseLogger } from '../../../../../helpers/log';
import { DeviceInformation } from '../../../models/device-information';
import { Brand } from '../../../models/enum/brand';
import { RegisterType } from '../../../models/enum/register-type';
import { holdingRegisters } from './holding-registers';
import { inputRegisters } from './input-registers';

export class AforeAFXKTH extends DeviceInformation {
    constructor() {
        super(
            'af-xk-th-three-phase-hybrid',
            Brand.Afore,
            'Afore AF XK-TH Three Phase Hybrid Inverter',
            'Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface',
        );

        this.supportsSolarman = true;
        this.deprecatedCapabilities = ['status_text.batter_state'];

        this.supportedFlows = {
            actions: {
                set_charge_command: this.setChargeCommand,
                write_value_to_register: this.writeValueToRegister,
                set_ems_mode: this.setEmsMode,
                set_ac_charging_timeslot: this.setAcChargingTimeslot,
                set_timing_ac_charge_off: this.setTimingAcChargeOff,
                set_timing_ac_charge_on: this.setTimingAcChargeOn,
            },
        };

        this.addInputRegisters(inputRegisters);
        this.addHoldingRegisters(holdingRegisters);
    }

    writeValueToRegister = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
        client.writeValueToRegister(args);
    };

    setChargeCommand = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
        const emsAddress = 2500;
        const commandAddress = 2501;
        const powerAddress = 2502;
        const registerType = RegisterType.Holding;

        const emsRegister = this.getRegisterByTypeAndAddress(registerType, emsAddress);
        const commandRegister = this.getRegisterByTypeAndAddress(registerType, commandAddress);
        const powerRegister = this.getRegisterByTypeAndAddress(registerType, powerAddress);

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

    setEmsMode = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
        const emsAddress = 2500;
        const registerType = RegisterType.Holding;

        const emsRegister = this.getRegisterByTypeAndAddress(registerType, emsAddress);

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

    setAcChargingTimeslot = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
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

        const startRegister = this.getRegisterByTypeAndAddress(registerType, startAddress);
        const endRegister = this.getRegisterByTypeAndAddress(registerType, endAddress);

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

    setTimingAcChargeOff = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
        const address = 206;
        const registerType = RegisterType.Holding;

        const register = this.getRegisterByTypeAndAddress(registerType, address);

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

    setTimingAcChargeOn = async (origin: IBaseLogger, args: any, client: IAPI): Promise<void> => {
        const enabledRegister = this.getRegisterByTypeAndAddress(RegisterType.Holding, 206);
        const acpchgmaxRegister = this.getRegisterByTypeAndAddress(RegisterType.Holding, 2504);
        const acsocmaxchgRegister = this.getRegisterByTypeAndAddress(RegisterType.Holding, 2505);

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
}
