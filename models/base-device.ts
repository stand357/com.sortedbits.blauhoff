/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { addCapabilityIfNotExists, capabilityChange, deprecateCapability, Device } from 'homey-helpers';
import { DateTime } from 'luxon';
import { IAPI } from '../api/iapi';
import { ModbusAPI } from '../api/modbus/modbus-api';
import { Solarman } from '../api/solarman/solarman';
import { DeviceRepository } from '../repositories/device-repository/device-repository';
import { getBrand } from '../repositories/device-repository/helpers/brand-name';
import { orderModbusRegisters } from '../repositories/device-repository/helpers/order-modbus-registers';
import { DeviceModel, SupportedFlowTypes } from '../repositories/device-repository/models/device-model';
import { AccessMode } from '../repositories/device-repository/models/enum/access-mode';
import { Brand } from '../repositories/device-repository/models/enum/brand';
import { ModbusDeviceDefinition } from '../repositories/device-repository/models/modbus-device-registers';
import { ModbusRegister, ModbusRegisterParseConfiguration } from '../repositories/device-repository/models/modbus-register';

export class BaseDevice extends Device {
    private api?: IAPI;
    private reachable: boolean = false;
    private readRegisterTimeout: NodeJS.Timeout | undefined;
    private device!: DeviceModel;

    public filteredLog(...args: any[]) {
        if (this.device.brand === Brand.Growatt) {
            this.log(args);
        }
    }

    private onDisconnect = async () => {
        if (this.readRegisterTimeout) {
            clearTimeout(this.readRegisterTimeout);
        }

        if (!this.api) {
            return;
        }

        const isOpen = await this.api.connect();

        if (!isOpen) {
            await this.setUnavailable('Modbus connection unavailable');

            this.homey.setTimeout(this.onDisconnect, 60000);
        } else {
            await this.setAvailable();
            await this.readRegisters();
        }
    };

    /**
     * Handles the value received from a Modbus register.
     *
     * @param value - The value received from the Modbus register.
     * @param register - The Modbus register object.
     * @returns A Promise that resolves when the value is handled.
     */
    private onDataReceived = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
        const result = parseConfiguration.calculateValue(value, buffer, this);

        if (this.device.brand === Brand.Deye) {
            this.filteredLog(parseConfiguration.capabilityId, result);
        }

        await capabilityChange(this, parseConfiguration.capabilityId, result);

        if (!this.reachable) {
            this.reachable = true;
            await capabilityChange(this, 'readable_boolean.device_status', true);
        }
    };

    /**
     * Handles the error that occurs during a Modbus operation.
     * If the error is a TransactionTimedOutError, sets the device as unreachable.
     * Otherwise, logs the error message.
     *
     * @param error - The error that occurred.
     * @param register - The Modbus register associated with the error.
     */
    private onError = async (error: unknown, register: ModbusRegister) => {
        if (error && (error as any)['name'] && (error as any)['name'] === 'TransactionTimedOutError') {
            this.reachable = false;
            await capabilityChange(this, 'readable_boolean.device_status', false);
        } else {
            this.error('Request failed', error);
        }
    };

    /**
     * Initializes the capabilities of the Modbus device based on the provided definition.
     * @param definition The Modbus device definition.
     */
    private initializeCapabilities = async (definition: ModbusDeviceDefinition) => {
        const inputRegisters = orderModbusRegisters(definition.inputRegisters);

        for (const register of inputRegisters) {
            if (register.accessMode !== AccessMode.WriteOnly) {
                for (const configuration of register.parseConfigurations) {
                    await addCapabilityIfNotExists(this, configuration.capabilityId);
                }
            }
        }

        const holdingRegisters = orderModbusRegisters(definition.holdingRegisters);
        for (const register of holdingRegisters) {
            if (register.accessMode !== AccessMode.WriteOnly) {
                for (const configuration of register.parseConfigurations) {
                    await addCapabilityIfNotExists(this, configuration.capabilityId);
                }
            }
        }
    };

    /**
     * Establishes a connection to the Modbus device.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     */
    private connect = async () => {
        const { host, port, unitId, solarman, serial } = this.getSettings();
        const { deviceType, modelId } = this.getData();

        if (this.readRegisterTimeout) {
            clearTimeout(this.readRegisterTimeout);
        }

        this.log('ModbusDevice', host, port, unitId, deviceType, modelId);

        await this.initializeCapabilities(this.device.definition);

        this.api = solarman ? new Solarman(this, this.device, host, serial, 8899, 1) : new ModbusAPI(this, host, port, unitId, this.device);
        this.api.setOnDataReceived(this.onDataReceived);
        this.api?.setOnError(this.onError);
        this.api?.setOnDisconnect(this.onDisconnect);

        const isOpen = await this.api.connect();

        if (isOpen) {
            await this.readRegisters();
        }
    };

    /**
     * onInit is called when the device is initialized.
     */
    async onInit() {
        await super.onInit();

        const { deviceType, modelId } = this.getData();

        const brand = getBrand(deviceType);
        if (!brand) {
            this.error('Unknown device type', deviceType);
            throw new Error('Unknown device type');
        }

        const result = DeviceRepository.getDeviceByBrandAndModel(brand, modelId);

        if (!result || !result?.definition) {
            this.error('Unknown device type', deviceType);
            throw new Error('Unknown device type');
        }

        this.device = result;
        this.filteredLog('ModbusDevice has been initialized');

        await deprecateCapability(this, 'status_code.device_online');
        await addCapabilityIfNotExists(this, 'readable_boolean.device_status');
        await addCapabilityIfNotExists(this, 'date.record');

        const deprecated = this.device.definition.deprecatedCapabilities;
        this.log('Deprecated capabilities', deprecated);
        if (deprecated) {
            for (const capability of deprecated) {
                this.log('Deprecating capability', capability);
                await deprecateCapability(this, capability);
            }
        }

        await this.connect();
    }

    /**
     * Reads the registers from the device.
     *
     * @returns {Promise<void>} A promise that resolves when the registers are read.
     */
    private readRegisters = async () => {
        if (!this.api) {
            this.error('ModbusAPI is not initialized');
            return;
        }

        const localTimezone = this.homey.clock.getTimezone();
        const date = DateTime.now();
        const localDate = date.setZone(localTimezone);

        await capabilityChange(this, 'date.record', localDate.toFormat('HH:mm:ss'));

        this.filteredLog('Reading registers for ', this.getName());

        await this.api.readRegistersInBatch();

        const { refreshInterval } = this.getSettings();

        this.filteredLog('Setting timeout', refreshInterval, this.reachable);
        const interval = this.reachable ? refreshInterval * 1000 : 60000;

        this.readRegisterTimeout = await this.homey.setTimeout(this.readRegisters.bind(this), interval);
    };

    /*    async writeRegisterByAddress(address: number, registerType: 'input' | 'holding', value: number) {
        this.log('writeRegisterByAddress', address, registerType, value);
        const registers = registerType === 'input' ? this.device.definition.inputRegisters : this.device.definition.holdingRegisters;
        const register = registers.find((r) => r.address === address);

        if (!register || register.accessMode === 'ReadOnly') {
            this.error('Register not found or read only', address);
            return;
        }

        if (!this.api) {
            this.error('ModbusAPI is not initialized');
            return;
        }

        await this.api.writeRegister(register, value);
    }
*/

    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
    async onAdded() {
        this.filteredLog('ModbusDevice has been added');
    }

    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({
        oldSettings,
        newSettings,
        changedKeys,
    }: {
        oldSettings: { [key: string]: boolean | string | number | undefined | null };
        newSettings: { [key: string]: boolean | string | number | undefined | null };
        changedKeys: string[];
    }): Promise<string | void> {
        this.filteredLog('ModbusDevice settings where changed');

        if (this.readRegisterTimeout) {
            clearTimeout(this.readRegisterTimeout);
        }

        if (this.api?.isConnected()) {
            await this.api?.disconnect();
        }

        await this.connect();
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name: string) {
        this.filteredLog('ModbusDevice was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted() {
        this.filteredLog('ModbusDevice has been deleted');

        if (this.readRegisterTimeout) {
            clearTimeout(this.readRegisterTimeout);
        }

        if (this.api?.isConnected()) {
            await this.api?.disconnect();
        }
    }

    callAction = async (action: string, args: any) => {
        const cleanArgs = {
            ...args,
        };

        if (cleanArgs.device) {
            delete cleanArgs.device;
        }

        this.log('callAction', this.device.name, action, JSON.stringify(cleanArgs));

        // First we check if the DeviceModel supports this called action

        if (!this.api) {
            this.error('API is not initialized');
            return;
        }

        if (!this.device.supportedFlows?.actions) {
            this.error('No supported actions found');
            return;
        }

        const flowType = SupportedFlowTypes[action as keyof typeof SupportedFlowTypes];

        const deviceAction = this.device.supportedFlows.actions[flowType];
        if (!deviceAction) {
            this.error('Unsupported action', action);
            return;
        }

        await deviceAction(this, args, this.api);
    };
}
