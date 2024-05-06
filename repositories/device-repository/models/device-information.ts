import { IBaseLogger } from '../../../helpers/log';
import { defaultValueConverter } from '../helpers/default-value-converter';
import { Brand } from './enum/brand';
import { RegisterType } from './enum/register-type';
import { ModbusRegister } from './modbus-register';
import { SupportedFlows } from './supported-flows';

export type DataConverter = (log: IBaseLogger, buffer: Buffer, register: ModbusRegister) => any;

export interface DeviceOptions {
    /**
     * The converter to use to convert the data read from the device
     *
     * @type {DataConverter}
     * @memberof DeviceInformation
     */
    converter?: DataConverter;

    /**
     * Does the device support the Solarman protocol
     *
     * @type {boolean}
     * @memberof DeviceInformation
     */
    supportsSolarman?: boolean;

    /**
     * Which capabilities are removed and should be removed from Homey.
     *
     * @type {string[]}
     * @memberof DeviceInformation
     */
    deprecatedCapabilities?: string[];

    supportedFlows?: SupportedFlows;
}

export class DeviceInformation {
    public readonly converter: DataConverter = defaultValueConverter;

    /**
     * The unique identifier of the device. Should be unique between all devices
     *
     * @type {string}
     * @memberof DeviceInformation
     */
    id: string;

    /**
     * Brand of the device, used during pairing
     *
     * @type {Brand}
     * @memberof DeviceInformation
     */
    brand: Brand;

    /**
     * The name of the device, used during pairing and as a display name
     *
     * @type {string}
     * @memberof DeviceInformation
     */
    name: string;

    /**
     * A description of the device, used during pairing
     *
     * @type {string}
     * @memberof DeviceInformation
     */
    description: string;

    public supportsSolarman: boolean = true;
    public deprecatedCapabilities: string[] = [];
    public inputRegisters: ModbusRegister[] = [];
    public holdingRegisters: ModbusRegister[] = [];
    public supportedFlows: SupportedFlows = {};

    constructor(id: string, brand: Brand, name: string, description: string) {
        this.id = id;
        this.brand = brand;
        this.name = name;
        this.description = description;
    }

    addInputRegisters(registers: ModbusRegister[]): DeviceInformation {
        this.inputRegisters.push(...registers);
        return this;
    }

    addHoldingRegisters(registers: ModbusRegister[]): DeviceInformation {
        this.holdingRegisters.push(...registers);
        return this;
    }

    getRegisterByTypeAndAddress(type: RegisterType, address: number): ModbusRegister | undefined {
        switch (type) {
            case RegisterType.Input:
                return this.inputRegisters.find((register) => register.address === address);
            case RegisterType.Holding:
                return this.holdingRegisters.find((register) => register.address === address);
            default:
                return undefined;
        }
    }
}
