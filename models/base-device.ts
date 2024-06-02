/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import Homey from 'homey';
import { addCapabilityIfNotExists, capabilityChange, deprecateCapability } from 'homey-helpers';

import { DateTime } from 'luxon';
import { IAPI } from '../api/iapi';
import { ModbusAPI } from '../api/modbus/modbus-api';
import { Solarman } from '../api/solarman/solarman';
import { DeviceRepository } from '../repositories/device-repository/device-repository';
import { orderModbusRegisters } from '../repositories/device-repository/helpers/order-modbus-registers';
import { Device } from '../repositories/device-repository/models/device';
import { AccessMode } from '../repositories/device-repository/models/enum/access-mode';
import { ModbusRegister, ModbusRegisterParseConfiguration } from '../repositories/device-repository/models/modbus-register';

export class BaseDevice extends Homey.Device {
    private api?: IAPI;
    private reachable: boolean = false;
    private readRegisterTimeout: NodeJS.Timeout | undefined;
    private device!: Device;
    private enabled: boolean = true;

    private runningRequest: boolean = false;

    private lastRequest?: DateTime;
    private lastValidRequest?: DateTime;

    public logDeviceName = () => {
        const { solarman, serial } = this.getSettings();
        const connectionType = solarman ? 'Solarman' : 'Modbus';
        //return brandToBrandName(this.device.brand) + ` (${connectionType})`;
        return this.getName();
    };

    public filteredLog(...args: any[]) {
        const params = [this.logDeviceName(), ...args];
        //        if (this.device.brand === Brand.Deye || this.device.brand === Brand.Afore) {
        this.log(...params);
        //        }
    }

    public filteredError(...args: any[]) {
        const params = [this.logDeviceName(), ...args];
        //        if (this.device.brand === Brand.Afore || this.device.brand === Brand.Deye) {
        this.error(...params);
        //        }
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

    private updateDeviceAvailability = async (value: boolean) => {
        const current = await this.getCapabilityValue('readable_boolean.device_status');

        if (value !== current) {
            await capabilityChange(this, 'readable_boolean.device_status', value);

            const trigger = value ? 'device_went_online' : 'device_went_offline';
            this.homey.flow.getTriggerCard(trigger).trigger(this, {});
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

        if (!parseConfiguration.validateValue(result)) {
            this.filteredError('Received invalid value', result);
            return;
        }

        this.lastValidRequest = DateTime.utc();

        await capabilityChange(this, parseConfiguration.capabilityId, result);

        if (!this.reachable) {
            this.reachable = true;
        }

        await this.updateDeviceAvailability(true);
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
            await this.updateDeviceAvailability(false);
        } else {
            this.filteredError('Request failed', error);
        }
    };

    /**
     * Initializes the capabilities of the Modbus device based on the provided definition.
     * @param definition The Modbus device definition.
     */
    private initializeCapabilities = async () => {
        const inputRegisters = orderModbusRegisters(this.device.inputRegisters);

        for (const register of inputRegisters) {
            if (register.accessMode !== AccessMode.WriteOnly) {
                for (const configuration of register.parseConfigurations) {
                    await addCapabilityIfNotExists(this, configuration.capabilityId);
                }
            }
        }

        const holdingRegisters = orderModbusRegisters(this.device.holdingRegisters);
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
        const { host, port, unitId, solarman, serial, enabled } = this.getSettings();
        const { deviceType, modelId } = this.getData();

        if (this.readRegisterTimeout) {
            clearTimeout(this.readRegisterTimeout);
        }

        this.filteredLog('ModbusDevice', host, port, unitId, deviceType, modelId, enabled);

        await this.initializeCapabilities();

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

        const { modelId } = this.getData();

        const result = DeviceRepository.getInstance().getDeviceById(modelId);

        if (!result) {
            this.filteredError('Unknown device type', modelId);
            throw new Error('Unknown device type');
        }

        this.device = result;
        this.filteredLog('ModbusDevice has been initialized');

        await deprecateCapability(this, 'status_code.device_online');
        await addCapabilityIfNotExists(this, 'readable_boolean.device_status');
        await addCapabilityIfNotExists(this, 'date.record');

        const deprecated = this.device.deprecatedCapabilities;
        this.filteredLog('Deprecated capabilities', deprecated);
        if (deprecated) {
            for (const capability of deprecated) {
                this.filteredLog('Deprecating capability', capability);
                await deprecateCapability(this, capability);
            }
        }

        const { enabled } = this.getSettings();
        this.enabled = enabled;

        if (this.enabled) {
            await this.connect();
        } else {
            await this.setUnavailable('Device is disabled');
            this.filteredLog('ModbusDevice is disabled');
        }
    }

    /**
     * Reads the registers from the device.
     *
     * @returns {Promise<void>} A promise that resolves when the registers are read.
     */
    private readRegisters = async () => {
        if (!this.api) {
            this.filteredError('ModbusAPI is not initialized');
            return;
        }

        this.lastRequest = DateTime.utc();

        const diff = this.lastValidRequest ? this.lastRequest.diff(this.lastValidRequest, 'minutes').minutes : 0;
        const { refreshInterval } = this.getSettings();

        if (diff > Math.max(2, refreshInterval / 60)) {
            await this.updateDeviceAvailability(false);
        }

        if (!this.enabled) {
            this.filteredLog('ModbusDevice is disabled, returning');
            return;
        }

        while (this.runningRequest) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        this.runningRequest = true;

        const localTimezone = this.homey.clock.getTimezone();
        const date = DateTime.now();
        const localDate = date.setZone(localTimezone);

        try {
            await capabilityChange(this, 'date.record', localDate.toFormat('HH:mm:ss'));
            await this.api.readRegistersInBatch();
        } catch (error) {
            this.filteredError('Error reading registers', error);
        } finally {
            this.runningRequest = false;
        }

        const interval = this.reachable ? (refreshInterval < 5 ? 5 : refreshInterval) * 1000 : 60000;
        this.readRegisterTimeout = await this.homey.setTimeout(this.readRegisters.bind(this), interval);
    };

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

        if (this.enabled !== undefined) {
            this.enabled = newSettings['enabled'] as boolean;
        }

        if (this.enabled) {
            this.filteredLog('ModbusDevice is enabled');
            await this.setAvailable();
            await this.connect();
        } else {
            this.filteredLog('ModbusDevice is disabled');
            await this.setUnavailable('Device is disabled');
        }
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

    /**
     * This method is called when a flow cart is being executed.
     *
     * @param {string} action The action name of the flow card
     * @param {*} args The arguments of the flow card
     * @param {number} [retryCount=0] The number of times the action has been retried
     * @memberof BaseDevice
     */
    callAction = async (action: string, args: any, retryCount: number = 0) => {
        if (retryCount > 3) {
            this.filteredError('Retry count exceeded');
            this.runningRequest = false;
            return;
        }

        if (retryCount === 0) {
            while (this.runningRequest) {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        }

        this.runningRequest = true;

        const cleanArgs = {
            ...args,
        };

        if (cleanArgs.device) {
            delete cleanArgs.device;
        }

        this.filteredLog('callAction', this.device.name, action);

        if (!this.api) {
            this.filteredError('API is not initialized');
            return;
        }

        if (args.device && args.device.device) {
            try {
                await (args.device as BaseDevice).device.callAction(this, action, args, this.api);
                this.runningRequest = false;
            } catch (error) {
                this.filteredError('Error calling action', error);

                await this.homey.setTimeout(
                    () => {
                        this.callAction(action, args, retryCount + 1);
                    },
                    500 * retryCount + 1,
                );
            }
        } else {
            this.filteredError('No args.device.device found');
        }
    };
}
