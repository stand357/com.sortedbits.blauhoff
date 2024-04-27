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
import { logBits, writeBitsToBuffer } from '../blauhoff/helpers/bits';

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

    /**
     * Reads a Modbus register without converting the data.
     *
     * @param register - The Modbus register to read.
     * @param registerType - The type of the register.
     * @returns A promise that resolves to the read data or undefined if the read operation failed.
     */
    readAddressWithoutConversion = async (register: ModbusRegister, registerType: RegisterType): Promise<ReadRegisterResult | undefined> => {
        const data =
            registerType === RegisterType.Input
                ? await this.client.readInputRegisters(register.address, register.length)
                : await this.client.readHoldingRegisters(register.address, register.length);

        this.log.log('Reading address', register.address, ':', data);

        return data;
    };

    /**
     * Reads a Modbus register and converts the data.
     *
     * @param register - The Modbus register to read.
     * @param registerType - The type of the register.
     * @returns A promise that resolves to the converted data or undefined if the read operation failed.
     */
    readAddress = async (register: ModbusRegister, registerType: RegisterType): Promise<any> => {
        const data = await this.readAddressWithoutConversion(register, registerType);

        if (data) {
            const result = this.deviceModel.definition.inputRegisterResultConversion(this.log, data.buffer, register);
            this.log.log('Conversion result', result);
            return result;
        }

        return undefined;
    };

    /**
     * Reads multiple Modbus registers in a batch operation.
     *
     * This method reads both input and holding registers in batches.
     * The batches are created using the `createRegisterBatches` function.
     * Each batch is then read using the `readBatch` method.
     *
     * If the `onDataReceived` callback is not set, an error is logged.
     *
     * @returns A promise that resolves when the batch operation is complete.
     */
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

    /**
     * Writes a value to a Modbus register.
     *
     * This method first checks if the register is read-only. If it is, the method returns false.
     * It then validates the value to be written using the `validateValue` function. If the value is invalid, an error is logged and the method returns false.
     * The method then attempts to write the value to the register. If the write operation fails, an error is logged and the method returns false.
     * If the write operation is successful, the method returns true.
     *
     * @param register - The Modbus register to write to.
     * @param value - The value to write.
     * @returns A promise that resolves to a boolean indicating whether the write operation was successful.
     */
    writeRegister = async (register: ModbusRegister, value: any): Promise<boolean> => {
        if (register.accessMode === AccessMode.ReadOnly) {
            return false;
        }

        if (!validateValue(value, register.dataType)) {
            this.log.error('Invalid value', value, 'for address', register.address, register.dataType);
            return false;
        }

        this.log.log('Writing to address', register.address, ':', value);

        try {
            const result = await this.client.writeRegisters(register.address, [value]);
            this.log.filteredLog('Output', result.address);
        } catch (error) {
            this.log.error('Error writing to register', error);
            return false;
        }

        return true;
    };

    /**
     * Writes a buffer to a Modbus register.
     *
     * This method first checks if the register is read-only. If it is, the method returns false.
     * The method then logs the buffer to be written and attempts to write the buffer to the register.
     * If the write operation fails, an error is logged and the method returns false.
     * If the write operation is successful, the method returns true.
     *
     * @param register - The Modbus register to write to.
     * @param buffer - The buffer to write.
     * @returns A promise that resolves to a boolean indicating whether the write operation was successful.
     */
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

    /**
     * Reads a batch of Modbus registers.
     *
     * This method reads either input or holding registers based on the register type.
     * It first checks if the batch is empty. If it is, the method returns.
     * It then calculates the length of the batch and attempts to read the registers.
     * If the read operation fails, an error is logged.
     * If the read operation is successful, the method iterates over the batch and processes each register.
     * The processing involves extracting a buffer from the read results and converting it to a value.
     * The conversion is done using either the `inputRegisterResultConversion` or `holdingRegisterResultConversion` method of the device model's definition.
     * If the `onDataReceived` callback is set, it is called with the converted value and the register.
     *
     * @param batch - The batch of Modbus registers to read.
     * @param registerType - The type of the registers.
     */
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

    /**
     * Writes a value to a specified Modbus register.
     *
     * This method first checks if the device and necessary parameters are defined. If not, it logs an error and returns.
     * It then retrieves the specified register from the device repository.
     * If the register is not found, it logs an error and returns.
     * It then logs the device and the parameters for the write operation.
     * Finally, it writes the value to the register and logs the result of the write operation.
     *
     * @param origin - The logger to use for logging.
     * @param args - An object containing the parameters for the write operation. It should have the following properties:
     *               - value: The value to write.
     *               - registerType: The type of the register.
     *               - register: The register to write to.
     *               - device: The device containing the register.
     * @returns A promise that resolves when the write operation is complete.
     */
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

    /**
     * Writes bits to a Modbus register.
     *
     * This method first reads the current value of the register. If the read operation fails, an error is logged and the method returns false.
     * It then checks if the bit index is within the range of the register. If it is not, an error is logged and the method returns false.
     * The method then calculates the byte index and the start bit index within the byte.
     * It then writes the bits to the buffer at the calculated indices.
     * Finally, it writes the buffer back to the register.
     *
     * @param register - The Modbus register to write to.
     * @param registerType - The type of the register.
     * @param bits - The bits to write.
     * @param bitIndex - The index at which to start writing the bits.
     * @returns A promise that resolves to a boolean indicating whether the write operation was successful.
     */
    writeBitsToRegister = async (register: ModbusRegister, registerType: RegisterType, bits: number[], bitIndex: number): Promise<boolean> => {
        const currentValue = await this.readAddressWithoutConversion(register, registerType);

        if (currentValue === undefined) {
            this.log.error('Failed to read current value');
            return false;
        }

        logBits(this.log, currentValue.buffer, currentValue.buffer.length);

        if (currentValue.buffer.length * 8 < bitIndex + bits.length) {
            this.log.error('Bit index out of range');
            return false;
        }

        const byteIndex = currentValue.buffer.length - 1 - Math.floor(bitIndex / 8);
        const startBitIndex = bitIndex % 8;

        this.log.log('writeBitsToRegister', registerType, bits, startBitIndex, byteIndex);

        const result = writeBitsToBuffer(currentValue.buffer, byteIndex, bits, startBitIndex);
        logBits(this.log, result, result.length);

        return await this.writeBufferRegister(register, result);
    };
}
