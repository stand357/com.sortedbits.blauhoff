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
    }

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
            await this.client.connectTCP(this.host, {
                port: this.port,
                keepAlive: true,
                timeout: 1000,
            });

            this.client.setID(1);
            this.client.setTimeout(1000);

            this.client.on('close', () => {
                this.log.filteredLog('Modbus connection closed');

                this.onApiDisconnect().then(() => {
                    this.log.filteredLog('Modbus connection re-established');
                }).catch((error) => {
                    this.log.error('Failed to re-establish Modbus connection', error);
                });
            });

            this.log.filteredLog('Modbus connection established', this.client.isOpen);

            return this.client.isOpen;
        } catch (error) {
            return false;
        }
    }

    /**
     * Disconnects from the Modbus server.
     */
    disconnect = () => {
        this.disconnecting = true;
        this.client.close(() => { });
    }

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
    static verifyConnection = async (log: IBaseLogger, host: string, port: number, unitId: number, deviceDefinition: ModbusDeviceDefinition): Promise<boolean> => {
        log.log('Creating modbus API');
        const api = new ModbusAPI(log, host, port, unitId, deviceDefinition);

        log.log('Connecting...');
        const result = await api.connect();

        // api.disconnect();
        if (result) {
            log.log('Disconnecting...');
        }

        return result;
    }

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
            try {
                const input = await this.client.readInputRegisters(register.address, register.length);
                this.log.filteredLog('Read input registers', input);
                const result = this.deviceDefinition.inputRegisterResultConversion(this.log, input, register);
                this.log.filteredLog('Conversion result', result);

                if (this.onDataReceived) {
                    await this.onDataReceived(result, register);
                }
            } catch (error) {
                this.log.error('Failed to readInputRegisters', error, register);
                if (this.onError) {
                    await this.onError(error, register);
                }
            }
        }

        for (const register of this.deviceDefinition.holdingRegisters) {
            try {
                const input = await this.client.readHoldingRegisters(register.address, register.length);
                const result = this.deviceDefinition.holdingRegisterResultConversion(this.log, input, register);

                if (this.onDataReceived) {
                    await this.onDataReceived(result, register);
                }
            } catch (error) {
                if (this.onError) {
                    await this.onError(error, register);
                } else {
                    this.log.error('Failed to readHoldingRegisters', error, register);
                }
            }
        }

        this.log.filteredLog('Finished reading registers');
    }

}
