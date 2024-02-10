import ModbusRTU from 'modbus-serial';
import { IBaseLogger } from '../../helpers/log';
import { ModbusRegister } from './models/modbus-register';
import { ModbusDeviceDefinition } from './models/modbus-device-registers';
import { Mode1, Mode2, Mode3 } from '../blauhoff/models/options/set-mode.options';

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
        this.log.log('Connecting to Modbus host:', this.host, 'port:', this.port, 'unitId:', this.unitId);

        try {
            await this.client.connectTCP(this.host, {
                port: this.port,
                keepAlive: true,
                timeout: 1000,
            });

            this.client.setID(1);
            this.client.setTimeout(1000);

            this.client.on('close', () => {
                this.log.log('Modbus connection closed');

                this.onDisconnect?.().then(() => {
                    this.log.log('Modbus connection re-established');
                }).catch((error) => {
                    this.log.error('Failed to re-establish Modbus connection', error);
                });
            });

            this.log.log('Modbus connection established', this.client.isOpen);

            return this.client.isOpen;
        } catch (error) {
            return false;
        }
    }

    setMode1 = async (options: Mode1): Promise<boolean> => {
        try {
            await this.client.writeRegisters(60001, [
                0, // Work mode
                1, // Remote start/stop inverter
                options.maxFeedInLimit, // MaxFeedinLimit
                0, // Battery Power Ref (-5000 - 5000)
                0, // uwPowerRefInvLimit (0 - 5000)
                0, // Power Limit of PV (0 - 8000)
                5000, // Timeout
                0, // VPPtimer_enable (0 = disable, 1 = enable)
                options.batCapMin, // BatCapMin (10 - 100)
            ]);

            return true;
        } catch (error) {
            this.log.error('Failed to setMode1', error);
            return false;
        }
    }

    setMode2 = async (options: Mode2): Promise<boolean> => {
        try {
            await this.client.writeRegisters(60001, [
                1, // Work mode
                1, // Remote start/stop inverter
                100, // MaxFeedinLimit
                options.batPower, // Battery Power Ref / Battery charge power (-5000 - 5000)
                0, // uwPowerRefInvLimit (0 - 5000)
                0, // Power Limit of PV (0 - 8000)
                options.timeout, // Timeout
                1, // VPPtimer_enable (0 = disable, 1 = enable)
                options.batCapMin, // BatCapMin (10 - 100)
            ]);

            return true;
        } catch (error) {
            this.log.error('Failed to setMode1', error);
            return false;
        }
    }

    setMode3 = async (options: Mode3): Promise<boolean> => {
        try {
            await this.client.writeRegisters(60001, [
                1, // Work mode
                1, // Remote start/stop inverter
                100, // MaxFeedinLimit
                options.batPower, // Battery Power Ref / Battery charge power (-5000 - 5000)
                0, // uwPowerRefInvLimit (0 - 5000)
                0, // Power Limit of PV (0 - 8000)
                options.timeout, // Timeout
                1, // VPPtimer_enable (0 = disable, 1 = enable)
                options.batCapMin, // BatCapMin (10 - 100)
            ]);

            return true;
        } catch (error) {
            this.log.error('Failed to setMode1', error);
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
                const result = this.deviceDefinition.inputRegisterResultConversion(this.log, input, register);

                if (this.onDataReceived) {
                    await this.onDataReceived(result, register);
                }
            } catch (error) {
                if (this.onError) {
                    await this.onError(error, register);
                } else {
                    this.log.error('Failed to readInputRegisters', error, register);
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

        this.log.log('Finished reading registers');
    }

}
