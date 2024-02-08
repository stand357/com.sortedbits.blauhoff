import ModbusRTU from 'modbus-serial';
import { IBaseLogger } from '../../helpers/log';
import { ModbusRegister } from './models/modbus-register';
import { DeviceInformation } from './helpers/convert-register-list';

export class ModbusAPI {

    private client: ModbusRTU;

    private host: string;
    private port: number;
    private unitId: number;
    private log: IBaseLogger;
    private deviceInfo: DeviceInformation;

    valueResolved?: (value: any, register: ModbusRegister) => void;

    constructor(log: IBaseLogger, host: string, port: number, unitId: number, deviceInfo: DeviceInformation) {
        this.host = host;
        this.port = port;
        this.unitId = unitId;
        this.client = new ModbusRTU();
        this.log = log;
        this.deviceInfo = deviceInfo;
    }

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

    disconnect = () => {
        this.client.close(() => { });
    }

    static verifyConnection = async (log: IBaseLogger, host: string, port: number, unitId: number, deviceInfo: DeviceInformation): Promise<boolean> => {
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

    readRegisters = async () => {
        if (!this.valueResolved) {
            this.log.error('No valueResolved function set');
        }

        for (const register of this.deviceInfo.inputRegisters) {
            try {
                const result = await this.client.readInputRegisters(register.address, register.length);

                console.log(result.buffer);

                const b = Buffer.from(result.buffer.toString());

                console.log(b.readFloatBE(0));

                const buffer = result.buffer.readFloatBE(0);

                if (this.valueResolved) {
                    this.valueResolved(buffer, register);
                }
            } catch (error) {
                this.log.error('Error reading register:', register.address, 'length:', register.length, 'error:', error);
            }
            // this.valueResolved!(result, register);
        }
    }

}
