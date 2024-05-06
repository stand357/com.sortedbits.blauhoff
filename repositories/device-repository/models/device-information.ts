import { IBaseLogger } from '../../../helpers/log';
import { defaultValueConverter } from '../helpers/default-value-converter';
import { Brand } from './enum/brand';
import { ModbusRegister } from './modbus-register';

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

    public readonly supportsSolarman: boolean = true;

    /**
     * Which capabilities are removed and should be removed from Homey.
     *
     * @type {string[]}
     * @memberof DeviceInformation
     */
    deprecatedCapabilities: string[] = [];

    inputRegisters: ModbusRegister[] = [];
    holdingRegisters: ModbusRegister[] = [];

    constructor(id: string, brand: Brand, name: string, description: string, options?: DeviceOptions) {
        this.id = id;
        this.brand = brand;
        this.name = name;
        this.description = description;

        if (options?.converter) {
            this.converter = options.converter;
        }

        if (options?.supportsSolarman !== undefined) {
            this.supportsSolarman = options.supportsSolarman;
        }
    }
}
