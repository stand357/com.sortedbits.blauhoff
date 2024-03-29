/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import ModbusRTU from 'modbus-serial';
import { register } from 'module';
import { IBaseLogger } from '../../helpers/log';
import { ModbusRegister } from './models/modbus-register';
import { ModbusDeviceDefinition } from './models/modbus-device-registers';
import { DeviceAction } from './helpers/set-modes';
import { Socket } from 'net';
import { createRegisterBatches } from './helpers/register-batches';
import { ReadRegisterResult } from 'modbus-serial/ModbusRTU';

enum RegisterType {
    Input,
    Holding,
}

/**
 * Represents a Modbus API.
 */
export class ModbusAPI {
    private client: ModbusRTU;

    private host: string;
    private port: number;
    private unitId: number;
    private log: IBaseLogger;
    private deviceDefinition: ModbusDeviceDefinition;
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
     * @param deviceDefinition - The Modbus device information.
     */
    constructor(log: IBaseLogger, host: string, port: number, unitId: number, deviceDefinition: ModbusDeviceDefinition) {
        this.host = host;
        this.port = port;
        this.unitId = unitId;
        this.client = new ModbusRTU();
        this.log = log;
        this.deviceDefinition = deviceDefinition;
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

                this.onApiDisconnect()
                    .then(() => {
                        this.log.filteredLog('Modbus connection re-established');
                    })
                    .catch((error) => {
                        this.log.error('Failed to re-establish Modbus connection', error);
                    });
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
     * @param deviceDefinition - The device information of the Modbus device.
     * @returns A promise that resolves to a boolean indicating the success of the connection.
     */
    static verifyConnection = async (
        log: IBaseLogger,
        host: string,
        port: number,
        unitId: number,
        deviceDefinition: ModbusDeviceDefinition,
    ): Promise<boolean> => {
        log.log('Creating modbus API');
        const api = new ModbusAPI(log, host, port, unitId, deviceDefinition);

        log.log('Connecting...');
        const result = await api.connect();

        // api.disconnect();
        if (result) {
            log.log('Disconnecting...');
        }

        return result;
    };

    readAddress = async (register: ModbusRegister): Promise<any> => {
        const input = await this.client.readInputRegisters(register.address, register.length);

        this.log.filteredLog('Read input registers', input);
        this.log.filteredLog('Data', input.data);
        this.log.filteredLog('Buffer', input.buffer);

        const result = this.deviceDefinition.inputRegisterResultConversion(this.log, input.buffer, register);
        this.log.filteredLog('Conversion result', result);

        return result;
    };

    readRegistersInBatch = async () => {
        if (!this.onDataReceived) {
            this.log.error('No valueResolved function set');
        }

        const inputBatches = createRegisterBatches(this.log, this.deviceDefinition.inputRegisters);
        for (const batch of inputBatches) {
            this.log.log(
                'Addresses in batch',
                batch.map((x) => x.address),
            );
            await this.readBatch(batch, RegisterType.Input);
        }

        const holdingBatches = createRegisterBatches(this.log, this.deviceDefinition.holdingRegisters);
        for (const batch of holdingBatches) {
            await this.readBatch(batch, RegisterType.Holding);
        }
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

        for (const register of this.deviceDefinition.inputRegisters) {
            await this.readBatch([register], RegisterType.Input);
        }

        for (const register of this.deviceDefinition.holdingRegisters) {
            await this.readBatch([register], RegisterType.Holding);
        }

        this.log.filteredLog('Finished reading registers');
    };

    callAction = async (mode: DeviceAction, args: any) => {
        if (this.deviceDefinition.actions && this.deviceDefinition.actions[mode]) {
            this.log.filteredLog('Setting mode', this.host, mode);
            await this.deviceDefinition.actions[mode](this.log, args, this.client);
        } else {
            this.log.error('No setMode function found for', this.host, mode);
        }
    };

    readBatch = async (batch: ModbusRegister[], registerType: RegisterType) => {
        if (batch.length === 0) {
            return;
        }

        const firstRegister = batch[0];
        const lastRegister = batch[batch.length - 1];

        const length = batch.length > 1 ? lastRegister.address + lastRegister.length - firstRegister.address : batch[0].length;

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
                        ? this.deviceDefinition.inputRegisterResultConversion(this.log, buffer, register)
                        : this.deviceDefinition.holdingRegisterResultConversion(this.log, buffer, register);

                if (this.onDataReceived) {
                    await this.onDataReceived(value, register);
                }
                startOffset = end;
            }
        } catch (error) {
            this.log.error('Error reading batch', error);
        }
    };
}
