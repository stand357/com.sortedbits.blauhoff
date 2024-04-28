import * as net from 'net';
import { IBaseLogger } from '../../helpers/log';
import { IAPI } from '../iapi';
import { createRegisterBatches } from '../modbus/helpers/register-batches';
import { IDeviceModel } from '../modbus/models/device/device-model';
import { RegisterType } from '../modbus/models/enum/register-type';
import { ModbusRegister } from '../modbus/models/modbus-register';
import { FrameDefinition } from './frame-definition';
import { calculateBufferCRC } from './helpers/buffer-crc-calculator';
import { parseResponse } from './helpers/response-parser';

/*
 * Attempting to port the amazing pysolarmanv5 library to TypeScript
 *
 * Please give the original author some love:
 * https://github.com/jmccrohan/pysolarmanv5
 *
 */
export class Solarman implements IAPI {
    private ipAddress: string;
    private port: number;
    private serialNumber: string;
    private slaveId: number;
    private timeout: number;
    private log: IBaseLogger;

    private deviceModel: IDeviceModel;
    private frameDefinition: FrameDefinition;

    private onDataReceived?: (value: any, register: ModbusRegister) => Promise<void>;

    setOnDataReceived(onDataReceived: (value: any, register: ModbusRegister) => Promise<void>): void {
        this.onDataReceived = onDataReceived;
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
    constructor(
        log: IBaseLogger,
        deviceModel: IDeviceModel,
        ipAddress: string,
        serialNumber: string,
        port: number = 8899,
        slaveId: number = 1,
        timeout: number = 60,
    ) {
        this.ipAddress = ipAddress;
        this.port = port;
        this.serialNumber = serialNumber;
        this.slaveId = slaveId;
        this.timeout = timeout;
        this.log = log;
        this.deviceModel = deviceModel;

        this.frameDefinition = new FrameDefinition(this.serialNumber);
    }
    writeValueToRegister(args: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getDeviceModel(): IDeviceModel {
        return this.deviceModel;
    }
    connect(): Promise<boolean> {
        this.log.log('Connecting');
        return Promise.resolve(true);
    }
    disconnect(): void {
        this.log.log('Disconnecting');
    }

    writeRegister = async (register: ModbusRegister, value: number): Promise<boolean> => {
        const request = this.createModbusWriteRequest(register, [value]);
        const result = await this.performRequest(request);

        this.log.log('Write register', register.address, value, result);
        //TODO: Make sure we return the right boolean
        return true;
    };

    writeBufferRegister = async (register: ModbusRegister, buffer: Buffer): Promise<boolean> => {
        const request = this.createModbusWriteRequest(register, buffer);
        const result = await this.performRequest(request);

        this.log.log('Write buffer register', register.address, buffer, result);

        //TODO: Make sure we return the right boolean
        return true;
    };

    writeBitsToRegister(register: ModbusRegister, registerType: RegisterType, bits: number[], bitIndex: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     * Reads a Modbus register and converts the data.
     *
     * @param register - The Modbus register to read.
     * @param registerType - The type of the register.
     * @returns A promise that resolves to the converted data or undefined if the read operation failed.
     */
    readAddress = async (register: ModbusRegister, registerType: RegisterType): Promise<any> => {
        this.log.log('Reading address', register.address, 'for:', register.capabilityId);
        const data = await this.readAddressWithoutConversion(register, registerType);

        if (data) {
            const response = parseResponse(this.log, data);
            if (response.length === 1) {
                const result = register.calculateValue(response[0], this.log);
                this.log.log('Fetched value for ', register.address, ':', result);
                return result;
            }
        }

        return undefined;
    };

    /**
     * Reads a Modbus register without converting the data.
     *
     * @param register - The Modbus register to read.
     * @param registerType - The type of the register.
     * @returns A promise that resolves to the read data or undefined if the read operation failed.
     */
    readAddressWithoutConversion = async (register: ModbusRegister, registerType: RegisterType): Promise<Buffer | undefined> => {
        const request = this.createModbusReadRequest(register, 1, registerType);
        const buffer = await this.performRequest(request);

        return buffer;
        /*
        if (!buffer) {
            return undefined;
        }

        if (this.onDataReceived) {
        }
        const response = parseRegistersFromResponse(this.log, [register], buffer);
        */
    };

    readRegistersInBatch = async (): Promise<void> => {
        if (!this.onDataReceived) {
            this.log.error('No valueResolved function set');
        }

        const inputBatches = createRegisterBatches(this.log, this.deviceModel.definition.inputRegisters);
        for (const batch of inputBatches) {
            await this.readBatch(batch, RegisterType.Input);
        }
        /*
        for (const register of this.deviceModel.definition.inputRegisters.filter((x) => x.accessMode !== AccessMode.WriteOnly)) {
            await this.readBatch([register], RegisterType.Input);
        }
        */
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
    readBatch = async (batch: ModbusRegister[], registerType: RegisterType): Promise<void> => {
        if (batch.length === 0) {
            return;
        }

        if (!this.onDataReceived) {
            this.log.log('No valueResolved function set');
            return;
        }

        const firstRegister = batch[0];
        const lastRegister = batch[batch.length - 1];

        const length = lastRegister.address - firstRegister.address + 1;

        this.log.log('Reading batch', firstRegister.address, length, registerType);

        try {
            const request = this.createModbusReadRequest(firstRegister, length, registerType);
            const response = await this.performRequest(request);

            if (response) {
                const data = parseResponse(this.log, response);
                console.log(data);

                if (data.length === batch.length) {
                    for (let i = 0; i < data.length; i++) {
                        const register = batch[i];
                        const value = data[i];

                        await this.onDataReceived(value, register);
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

    performRequest = async (request: Buffer) => {
        const client = new net.Socket();
        client.setTimeout(this.timeout * 1000);

        return new Promise<Buffer | undefined>((resolve, reject) => {
            client.on('data', (data) => {
                client.end();
                this.log.log('Data', data);
                const buffer = this.frameDefinition.unwrapResponseFrame(data);
                resolve(buffer);
            });

            client.on('timeout', () => {
                this.log.error('Timeout');
                client.end();
                reject(undefined);
            });

            client.on('error', (error) => {
                this.log.error('Error', error);
                client.end();
                resolve(undefined);
            });

            client.connect(this.port, this.ipAddress, () => {
                this.log.log('Connected to datalogger');
                client.write(request);
            });
        });
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
        this.log.log('Write request', buffer);

        const request = this.frameDefinition.wrapModbusFrame(buffer);
        return request;
    }

    createModbusReadRequest(startRegister: ModbusRegister, length: number, registerType: RegisterType): Buffer {
        const command = registerType === RegisterType.Input ? 0x04 : 0x03;
        const modbusFrame = this.createModbusFrame(startRegister, length, command);
        const request = this.frameDefinition.wrapModbusFrame(modbusFrame);
        return request;
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
