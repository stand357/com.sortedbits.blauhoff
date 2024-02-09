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
    private deviceInfo: ModbusDeviceDefinition;

    /**
     * Callback function that is called when a value is resolved.
     *
     * @param value - The resolved value.
     * @param register - The Modbus register associated with the resolved value.
     * @returns A promise that resolves when the callback function completes.
     */
    valueResolved?: (value: any, register: ModbusRegister) => Promise<void>;

    /**
     * Represents a Modbus API.
     * @param log - The logger instance.
     * @param host - The host address.
     * @param port - The port number.
     * @param unitId - The unit ID.
     * @param deviceInfo - The Modbus device information.
     */
    constructor(log: IBaseLogger, host: string, port: number, unitId: number, deviceInfo: ModbusDeviceDefinition) {
        this.host = host;
        this.port = port;
        this.unitId = unitId;
        this.client = new ModbusRTU();
        this.log = log;
        this.deviceInfo = deviceInfo;
    }

    /**
     * Establishes a connection to the Modbus host.
     *
     * @returns A promise that resolves to a boolean indicating whether the connection was successful.
     */
    connect = async (): Promise<boolean> => {
        this.log.log('Connecting to Modbus host:', this.host, 'port:', this.port, 'unitId:', this.unitId);

        try {
            await this.client.connectTCP(this.host, {
                port: this.port,
                keepAlive: true,
                timeout: 2000,
            });

            this.client.setID(this.unitId);

            this.client.on('close', () => {
                this.log.log('Modbus connection closed');
            });

            this.log.log('Modbus connection established', this.client.isOpen);

            return this.client.isOpen;
        } catch (error) {
            return false;
        }
    }

    /**
     * Disconnects from the Modbus server.
     */
    disconnect = () => {
        this.client.close(() => { });
    }

    /**
     * Verifies the connection to a Modbus device.
     *
     * @param log - The logger instance.
     * @param host - The host address of the Modbus device.
     * @param port - The port number of the Modbus device.
     * @param unitId - The unit ID of the Modbus device.
     * @param deviceInfo - The device information of the Modbus device.
     * @returns A promise that resolves to a boolean indicating the success of the connection.
     */
    static verifyConnection = async (log: IBaseLogger, host: string, port: number, unitId: number, deviceInfo: ModbusDeviceDefinition): Promise<boolean> => {
        log.log('Creating modbus API');
        const api = new ModbusAPI(log, host, port, unitId, deviceInfo);

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
        if (!this.valueResolved) {
            this.log.error('No valueResolved function set');
        }

        for (const register of this.deviceInfo.inputRegisters) {
            try {
                const input = await this.client.readInputRegisters(register.address, register.length);
                const result = this.deviceInfo.inputRegisterResultConversion(this.log, input, register);

                if (this.valueResolved) {
                    await this.valueResolved(result, register);
                }
            } catch (error) {
                this.log.error('Error reading register:', register.address, 'length:', register.length, 'error:', error);
            }
        }

        for (const register of this.deviceInfo.holdingRegisters) {
            try {
                const input = await this.client.readHoldingRegisters(register.address, register.length);
                const result = this.deviceInfo.holdingRegisterResultConversion(this.log, input, register);

                if (this.valueResolved) {
                    await this.valueResolved(result, register);
                }
            } catch (error) {
                this.log.error('Error reading register:', register.address, 'length:', register.length, 'error:', error);
            }
        }

        this.log.log('Finished reading registers');
    }

}
