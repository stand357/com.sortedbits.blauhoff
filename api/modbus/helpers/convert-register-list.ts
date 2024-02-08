import { DeviceModbusRegister } from '../../../drivers/blauhoff-modbus/definitions/definitions';
import { ModbusRegister } from '../models/modbus-register';
import { RegisterCalculation } from '../models/register-calculation';
import { RegisterDataType } from '../models/register-datatype';

export interface DeviceInformation {
    inputRegisters: ModbusRegister[];
    holdingRegisters: ModbusRegister[];
}

const convertRegister = (register: any): ModbusRegister => {
    return {
        address: register[0] as number,
        length: register[1] as number,
        dataType: register[2] as RegisterDataType,
        scale: register[3] as number,
        capabilityId: register[4] as string,
        calculation: register[5] as RegisterCalculation,
        unit: register[6] as string,
        multiplier: register[7] as number,
    };
};

export const convertRegisterList = (device: DeviceModbusRegister): DeviceInformation => {
    const inputRegisters = device.inputRegisters.map(convertRegister);
    const holdingRegisters = device.holdingRegisters.map(convertRegister);

    return {
        inputRegisters,
        holdingRegisters,
    };
};
