import { DeviceInformation } from '../repositories/device-repository/models/device-information';
import { RegisterType } from '../repositories/device-repository/models/enum/register-type';
import { ModbusRegister, ModbusRegisterParseConfiguration } from '../repositories/device-repository/models/modbus-register';

export interface IAPI {
    getDeviceModel(): DeviceInformation;

    setOnDataReceived(onDataReceived: (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => Promise<void>): void;
    setOnError(onError: (error: unknown, register: ModbusRegister) => Promise<void>): void;
    setOnDisconnect(onDisconnect: () => Promise<void>): void;

    // readAddress(register: ModbusRegister, registerType: RegisterType): Promise<any>;
    readAddressWithoutConversion(register: ModbusRegister, registerType: RegisterType): Promise<Buffer | undefined>;
    readRegistersInBatch(): Promise<void>;

    isConnected(): boolean;

    connect(): Promise<boolean>;
    disconnect(): void;

    writeRegister(register: ModbusRegister, value: any): Promise<boolean>;
    writeValueToRegister(args: any): Promise<void>;
    writeBufferRegister(register: ModbusRegister, buffer: Buffer): Promise<boolean>;
    writeBitsToRegister(register: ModbusRegister, registerType: RegisterType, bits: number[], bitIndex: number): Promise<boolean>;
}
