import { writeBitsToBufferBE } from '../../helpers/bits';
import { IBaseLogger } from '../../helpers/log';
import { validateValue } from '../../helpers/validate-value';
import { createRegisterBatches } from '../../repositories/device-repository/helpers/register-batches';
import { Device } from '../../repositories/device-repository/models/device';
import { AccessMode } from '../../repositories/device-repository/models/enum/access-mode';
import { RegisterType } from '../../repositories/device-repository/models/enum/register-type';
import { ModbusRegister, ModbusRegisterParseConfiguration } from '../../repositories/device-repository/models/modbus-register';
import { AsyncSocket } from '../async-socket/async-socket';
import { IAPI } from '../iapi';
import { calculateBufferCRC } from './helpers/buffer-crc-calculator';
import { parseResponse } from './helpers/response-parser';
import { FrameDefinition } from './models/frame-definition';

/*
 * Attempting to port the amazing pysolarmanv5 library to TypeScript
 *
 * Please give the original author some love:
 * https://github.com/jmccrohan/pysolarmanv5
 *
 */
export class Solarman implements IAPI {
    private runningRequest = false;

    private ipAddress: string;
    private port: number;
    private serialNumber: string;
    private slaveId: number;
    private timeout: number;
    private log: IBaseLogger;

    private device: Device;
    private frameDefinition: FrameDefinition;
    private onDataReceived?: (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => Promise<void>;
    onError?: (error: unknown, register: ModbusRegister) => Promise<void>;
    onDisconnect?: () => Promise<void>;

    isConnected(): boolean {
        return true;
    }

    setOnDataReceived(onDataReceived: (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => Promise<void>): void {
        this.onDataReceived = onDataReceived;
    }

    setOnError(onError: (error: unknown, register: ModbusRegister) => Promise<void>): void {
        this.onError = onError;
    }

    setOnDisconnect(onDisconnect: () => Promise<void>): void {
        this.onDisconnect = onDisconnect;
    }

    /**
     * Creates an instance of Solarman API.
     * @param {IBaseLogger} log The logger instance
     * @param {string} ipAddress The IP address of the datalogger device
     * @param {string} serialNumber The serial number of the datalogger device
     * @param {number} port The port number of the datalogger device (default: 8899)
     * @param {number} slaveId The Modbus slave ID of the inverter (default: 1)
     * @param {number} timeout Socket timeout in seconds (default: 60)
     * @memberof Solarman
     */
    constructor(log: IBaseLogger, device: Device, ipAddress: string, serialNumber: string, port: number = 8899, slaveId: number = 1, timeout: number = 5) {
        this.ipAddress = ipAddress;
        this.port = port;
        this.serialNumber = serialNumber;
        this.slaveId = slaveId;
        this.timeout = timeout;
        this.log = log;
        this.device = device;

        this.frameDefinition = new FrameDefinition(this.serialNumber);
    }
    writeValueToRegister(args: any): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getDeviceModel(): Device {
        return this.device;
    }

    connect(): Promise<boolean> {
        this.log.log('Connecting');
        return Promise.resolve(true);
    }

    disconnect(): void {
        this.log.log('Disconnecting');
    }

    writeRegister = async (register: ModbusRegister, value: number): Promise<boolean> => {
        if (register.accessMode === AccessMode.ReadOnly) {
            return false;
        }

        if (!validateValue(value, register.dataType)) {
            this.log.error('Unable to write register, invalid value', value, register.dataType);
            return false;
        }

        const request = this.createModbusWriteRequest(register, [value]);

        try {
            const result = await this.performRequest(request);
            this.log.log('Write register', register.address, value, result);
            //TODO: Make sure we return the right boolean
            return true;
        } catch (error) {
            this.log.error('Error writing register', error);
            return false;
        }
    };

    writeBufferRegister = async (register: ModbusRegister, buffer: Buffer): Promise<boolean> => {
        const request = this.createModbusWriteRequest(register, buffer);

        try {
            await this.performRequest(request);
            return true;
        } catch (error) {
            this.log.error('Error writing buffer', error);
            return false;
        }
    };

    writeBitsToRegister = async (register: ModbusRegister, bits: number[], bitIndex: number): Promise<boolean> => {
        const readBuffer = await this.readAddressWithoutConversion(register);

        if (readBuffer === undefined) {
            this.log.error('Failed to read current value');
            return false;
        }

        if (readBuffer.length * 8 < bitIndex + bits.length) {
            this.log.error('Bit index out of range');
            return false;
        }

        const result = writeBitsToBufferBE(readBuffer, bits, bitIndex);

        try {
            return await this.writeBufferRegister(register, result);
        } catch (error) {
            this.log.error('Error writing bits', error);
        }
        return false;
    };

    /**
     * Reads a Modbus register without converting the data.
     *
     * @param register - The Modbus register to read.
     * @param registerType - The type of the register.
     * @returns A promise that resolves to the read data or undefined if the read operation failed.
     */
    readAddressWithoutConversion = async (register: ModbusRegister): Promise<Buffer | undefined> => {
        const request = this.createModbusReadRequest(register, register.length);
        const buffer = await this.performRequest(request);

        if (buffer) {
            const response = parseResponse(this.log, buffer, [register]);
            if (response.length === 1) {
                return response[0];
            }
        }

        return undefined;
    };

    fakeBatches = (registers: ModbusRegister[]): ModbusRegister[][] => {
        const result = registers.map((register) => {
            return [register];
        });

        return result;
    };

    readAllAtOnce = async (): Promise<void> => {
        // this.fakeBatches(this.deviceModel.definition.inputRegisters); //
        const inputBatches = createRegisterBatches(this.log, this.device.inputRegisters);
        for (const batch of inputBatches) {
            this.readBatch(batch);
        }

        const holidingBatches = createRegisterBatches(this.log, this.device.holdingRegisters);
        for (const batch of holidingBatches) {
            this.readBatch(batch);
        }
    };

    readRegistersInBatch = async (): Promise<void> => {
        if (!this.onDataReceived) {
            this.log.error('No valueResolved function set');
        }

        // this.fakeBatches(this.deviceModel.definition.inputRegisters); //
        const inputBatches = createRegisterBatches(this.log, this.device.inputRegisters);
        for (const batch of inputBatches) {
            await this.readBatch(batch);
        }

        const holidingBatches = createRegisterBatches(this.log, this.device.holdingRegisters);
        for (const batch of holidingBatches) {
            await this.readBatch(batch);
        }
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
    readBatch = async (batch: ModbusRegister[]): Promise<void> => {
        if (batch.length === 0) {
            return;
        }

        if (!this.onDataReceived) {
            this.log.log('No valueResolved function set');
            return;
        }

        const firstRegister = batch[0];
        const lastRegister = batch[batch.length - 1];

        const length = lastRegister.address + lastRegister.length - firstRegister.address + 1;

        try {
            const request = this.createModbusReadRequest(firstRegister, length);
            const response = await this.performRequest(request);

            if (response) {
                const data = parseResponse(this.log, response, batch);

                if (data.length === batch.length) {
                    for (let i = 0; i < data.length; i++) {
                        const register = batch[i];
                        const value = data[i];

                        try {
                            const convertedValue = this.device.converter(this.log, value, register);

                            if (validateValue(convertedValue, register.dataType)) {
                                for (const configuration of register.parseConfigurations) {
                                    await this.onDataReceived(convertedValue, value, configuration);
                                }
                            } else {
                                this.log.error('Invalid value', convertedValue, register.registerType);
                            }
                        } catch (error) {
                            this.log.error('Invalid value', value, 'for address', register.address, register.dataType);
                        }
                    }
                } else {
                    this.log.error('Mismatch in response length', data.length, batch.length);
                }
            } else {
                this.log.error('No response');
            }
        } catch (error) {
            this.log.error('Error reading batch', error);
        }
    };

    performRequest = async (request: Buffer): Promise<Buffer | undefined> => {
        while (this.runningRequest) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.runningRequest = true;
        const result = await this.performRequestQueued(request);
        this.runningRequest = false;
        return result;
    };

    performRequestQueued = async (request: Buffer): Promise<Buffer | undefined> => {
        const socket = new AsyncSocket(this.port, this.ipAddress);
        try {
            await socket.connect();

            const wrapped = this.frameDefinition.wrapModbusFrame(request);

            const data = await socket.write(wrapped.buffer);

            const unwrapped = this.frameDefinition.unwrapResponseFrame(data);

            return unwrapped.buffer;
        } catch (error) {
            this.log.error('Error performing request', error);

            return undefined;
        } finally {
            socket.disconnect();
        }
    };

    createModbusWriteRequest(register: ModbusRegister, value: Buffer | Array<number>): Buffer {
        // https://github.com/yaacov/node-modbus-serial/blob/49ecaf3caf93dfedf1dab19b2dec01de07aabe27/index.js#L1028

        let dataLength = value.length;
        if (Buffer.isBuffer(value)) {
            dataLength = value.length / 2;
        }

        const codeLength = 7 + 2 * dataLength;

        const buffer = Buffer.alloc(codeLength + 2);
        buffer.writeUInt8(this.slaveId, 0);
        buffer.writeUInt8(16, 1);
        buffer.writeUInt16BE(register.address, 2);
        buffer.writeUInt16BE(dataLength, 4);
        buffer.writeUInt8(dataLength * 2, 6);

        if (Buffer.isBuffer(value)) {
            value.copy(buffer, 7);
        } else {
            for (let i = 0; i < dataLength; i++) {
                buffer.writeUInt16BE(value[i], 7 + 2 * i);
            }
        }

        buffer.writeUInt16LE(calculateBufferCRC(buffer.subarray(0, -2)), codeLength);

        return buffer;
    }

    createModbusReadRequest(startRegister: ModbusRegister, length: number): Buffer {
        const command = startRegister.registerType === RegisterType.Input ? 0x04 : 0x03;
        const modbusFrame = this.createModbusFrame(startRegister, length, command);
        return modbusFrame;
    }

    //requestHoldingRegisters
    createModbusFrame(startRegister: ModbusRegister, length: number, command: number) {
        const codeLength = 6;
        const buffer = Buffer.alloc(codeLength + 2);

        buffer.writeUInt8(this.slaveId, 0);
        buffer.writeUInt8(command, 1);
        buffer.writeUInt16BE(startRegister.address, 2);
        buffer.writeUInt16BE(length, 4);
        buffer.writeUInt16LE(calculateBufferCRC(buffer.subarray(0, -2)), codeLength);

        return buffer;
    }
}
