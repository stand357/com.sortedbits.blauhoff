/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import ModbusRTU from 'modbus-serial';
import { IBaseLogger } from '../../helpers/log';
import { ModbusRegister } from './models/modbus-register';
import { ModbusDeviceDefinition } from './models/modbus-device-registers';
import { Socket } from 'net';
import { createRegisterBatches } from './helpers/register-batches';
import { AccessMode } from './models/enum/access-mode';
import { validateValue } from './helpers/validate-value';
import { DeviceRepository } from './device-repository/device-repository';
import { DeviceModel } from './models/device-model';
import { RegisterType } from './models/enum/register-type';
import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';

/**
 * Represents a Modbus API.
 */
export class ModbusAPI {
    public client: ModbusRTU;

    private host: string;
    private port: number;
    private unitId: number;
    private log: IBaseLogger;
    private deviceModel: DeviceModel;
    private disconnecting: boolean = false;

    get isOpen(): boolean {
        return this.client.isOpen;
    }

    /**
     * Callback function that is called when a value is resolved.
     *
     * @param value - The resolved value.
     * @param register - The Modbus register associated with the resolved value.
     * @returns A promise that resolves when the callback function completes.
     */
    onDataReceived?: (value: any, register: ModbusRegister) => Promise<void>;
    onError?: (error: unknown, register: ModbusRegister) => Promise<void>;
    onDisconnect?: () => Promise<void>;

    private onApiDisconnect = async () => {
        if (this.onDisconnect && !this.disconnecting) {
            await this.onDisconnect();
        }
    };

    /**
     * Represents a Modbus API.
     * @param log - The logger instance.
     * @param host - The host address.
     * @param port - The port number.
     * @param unitId - The unit ID.
     * @param deviceModel - The Modbus device information.
     */
    constructor(log: IBaseLogger, host: string, port: number, unitId: number, deviceModel: DeviceModel) {
        this.host = host;
        this.port = port;
        this.unitId = unitId;
        this.client = new ModbusRTU();
        this.log = log;
        this.deviceModel = deviceModel;
    }

    /**
     * Establishes a connection to the Modbus host.
     *
     * @returns A promise that resolves to a boolean indicating whether the connection was successful.
     */
    connect = async (): Promise<boolean> => {
        this.log.filteredLog('Connecting to Modbus host:', this.host, 'port:', this.port, 'unitId:', this.unitId);
        this.disconnecting = false;

        try {
            const socket = new Socket({
                allowHalfOpen: true,
            });

            socket.on('data', (data) => {
                this.log.filteredLog('Received data', data.toString());
            });

            await this.client.connectTCP(this.host, {
                port: this.port,
                keepAlive: true,
                timeout: 1000,
            });

            this.client.setID(this.unitId);
            this.client.setTimeout(1000);

            this.client.on('close', () => {
                this.log.filteredLog('Modbus connection closed');

                if (!this.disconnecting) {
                    this.onApiDisconnect()
                        .then(() => {
                            this.log.filteredLog('Modbus connection re-established');
                        })
                        .catch((error) => {
                            this.log.error('Failed to re-establish Modbus connection', error);
                        });
                }

                this.disconnecting = false;
            });

            this.log.filteredLog('Modbus connection established', this.client.isOpen);

            return this.client.isOpen;
        } catch (error) {
            return false;
        }
    };

    /**
     * Disconnects from the Modbus server.
     */
    disconnect = () => {
        this.disconnecting = true;
        this.client.close(() => {});
    };

    /**
     * Verifies the connection to a Modbus device.
     *
     * @param log - The logger instance.
     * @param host - The host address of the Modbus device.
     * @param port - The port number of the Modbus device.
     * @param unitId - The unit ID of the Modbus device.
     * @param deviceModel - The device information of the Modbus device.
     * @returns A promise that resolves to a boolean indicating the success of the connection.
     */
    static verifyConnection = async (log: IBaseLogger, host: string, port: number, unitId: number, deviceModel: DeviceModel): Promise<boolean> => {
        log.log('Creating modbus API');
        const api = new ModbusAPI(log, host, port, unitId, deviceModel);

        log.log('Connecting...');
        const result = await api.connect();

        // api.disconnect();
        if (result) {
            log.log('Disconnecting...');
        }

        return result;
    };

    getAddressByType = (registerType: RegisterType, address: number): ModbusRegister | undefined => {
        return DeviceRepository.getRegisterByTypeAndAddress(this.deviceModel, registerType.toString(), address);
    };

    readAddressWithoutConversion = async (register: ModbusRegister, registerType: RegisterType): Promise<ReadRegisterResult | undefined> => {
        if (register.accessMode === AccessMode.WriteOnly) {
            return undefined;
        }

        const data =
            registerType === RegisterType.Input
                ? await this.client.readInputRegisters(register.address, register.length)
                : await this.client.readHoldingRegisters(register.address, register.length);

        this.log.log('Read registers', data);
        this.log.log('Data', data.data);
        this.log.log('Buffer', data.buffer);

        return data;
    };

    readAddress = async (register: ModbusRegister, registerType: RegisterType): Promise<any> => {
        const data = await this.readAddressWithoutConversion(register, registerType);

        if (data) {
            const result = this.deviceModel.definition.inputRegisterResultConversion(this.log, data.buffer, register);
            this.log.log('Conversion result', result);
            return result;
        }

        return undefined;
    };

    readRegistersInBatch = async () => {
        if (!this.onDataReceived) {
            this.log.error('No valueResolved function set');
        }

        const inputBatches = createRegisterBatches(this.log, this.deviceModel.definition.inputRegisters);

        for (const batch of inputBatches) {
            await this.readBatch(batch, RegisterType.Input);
        }

        const holdingBatches = createRegisterBatches(this.log, this.deviceModel.definition.holdingRegisters);

        for (const batch of holdingBatches) {
            await this.readBatch(batch, RegisterType.Holding);
        }
    };

    writeRegister = async (register: ModbusRegister, value: any): Promise<boolean> => {
        if (register.accessMode === AccessMode.ReadOnly) {
            return false;
        }

        if (!validateValue(value, register.dataType)) {
            this.log.error('Invalid value', value, 'for register', register.address, register.dataType);
            return false;
        }

        this.log.log('Writing to register', register.address, value, typeof value);

        try {
            const result = await this.client.writeRegisters(register.address, [value]);
            this.log.filteredLog('Output', result.address);
        } catch (error) {
            this.log.error('Error writing to register', error);
            return false;
        }

        return true;
    };

    writeBufferRegister = async (register: ModbusRegister, buffer: Buffer): Promise<boolean> => {
        if (register.accessMode === AccessMode.ReadOnly) {
            return false;
        }

        this.log.log('Writing to register', register.address, buffer, typeof buffer);

        try {
            const result = await this.client.writeRegisters(register.address, buffer);
            this.log.filteredLog('Output', result.address);
        } catch (error) {
            this.log.error('Error writing to register', error);
            return false;
        }

        return true;
    };

    /**
     * Reads the input and holding registers of the Modbus device.
     *
     * @returns {Promise<void>} A promise that resolves when all registers have been read.
     */
    readRegisters = async () => {
        if (!this.onDataReceived) {
            this.log.error('No valueResolved function set');
        }

        for (const register of this.deviceModel.definition.inputRegisters.filter((x) => x.accessMode !== AccessMode.WriteOnly)) {
            await this.readBatch([register], RegisterType.Input);
        }

        for (const register of this.deviceModel.definition.holdingRegisters.filter((x) => x.accessMode !== AccessMode.WriteOnly)) {
            await this.readBatch([register], RegisterType.Holding);
        }

        this.log.filteredLog('Finished reading registers');
    };

    readBatch = async (batch: ModbusRegister[], registerType: RegisterType) => {
        if (batch.length === 0) {
            return;
        }

        const firstRegister = batch[0];
        const lastRegister = batch[batch.length - 1];

        const length = batch.length > 1 ? lastRegister.address + lastRegister.length - firstRegister.address : batch[0].length;

        //        this.log.log('Reading batch', firstRegister.address, length, registerType === RegisterType.Input ? 'Input' : 'Holding');

        try {
            const results =
                registerType === RegisterType.Input
                    ? await this.client.readInputRegisters(firstRegister.address, length)
                    : await this.client.readHoldingRegisters(firstRegister.address, length);

            let startOffset = 0;
            for (const register of batch) {
                const end = startOffset + register.length * 2;
                const buffer = batch.length > 1 ? results.buffer.subarray(startOffset, end) : results.buffer;

                //const value = conversionFunction(this.log, buffer, register);
                const value =
                    registerType === RegisterType.Input
                        ? this.deviceModel.definition.inputRegisterResultConversion(this.log, buffer, register)
                        : this.deviceModel.definition.holdingRegisterResultConversion(this.log, buffer, register);

                if (this.onDataReceived) {
                    await this.onDataReceived(value, register);
                }
                startOffset = end;
            }
        } catch (error) {
            this.log.error('Error reading batch', error);
        }
    };

    writeValueToRegister = async (origin: IBaseLogger, args: any): Promise<void> => {
        const { value, registerType, register, device } = args;

        if (device.device === undefined) {
            origin.error('Device is undefined');
            return;
        }

        if (value === undefined || registerType === undefined || !register) {
            origin.log('Wait, something is missing', value, registerType, register);
            return;
        }

        if (!register || !register.address) {
            origin.error('Register is undefined');
            return;
        }

        const foundRegister = DeviceRepository.getRegisterByTypeAndAddress(device.device, registerType, register.address);

        if (!foundRegister) {
            origin.error('Register not found');
            return;
        }

        origin.log('Device', JSON.stringify(device.device, null, 2));

        origin.log('write_value_to_register', value, registerType, register);

        const result = await this.writeRegister(foundRegister, value);
        origin.log('Write result', result);
    };
}
