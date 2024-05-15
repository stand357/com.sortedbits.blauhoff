import { Device } from '../device';
import { Brand } from '../enum/brand';
import { RegisterDataType } from '../enum/register-datatype';
import { RegisterType } from '../enum/register-type';
import { ModbusRegister } from '../modbus-register';

describe('Device', () => {
    let device: Device;

    beforeEach(() => {
        device = new Device('test-id', Brand.Deye, 'test-name', 'test-description');
    });

    test('addInputRegisters', () => {
        const registers = [new ModbusRegister(1, 1, RegisterDataType.UINT16), new ModbusRegister(2, 1, RegisterDataType.UINT16)];
        device.addInputRegisters(registers);
        expect(device.inputRegisters).toEqual(registers);
        registers.forEach((register) => expect(register.registerType).toBe(RegisterType.Input));
    });

    test('addHoldingRegisters', () => {
        const registers = [new ModbusRegister(5, 1, RegisterDataType.FLOAT32), new ModbusRegister(6, 1, RegisterDataType.UINT32)];
        device.addHoldingRegisters(registers);
        expect(device.holdingRegisters).toEqual(registers);
        registers.forEach((register) => expect(register.registerType).toBe(RegisterType.Holding));
    });

    test('getRegisterByTypeAndAddress', () => {
        const holdingRegisters = [new ModbusRegister(5, 1, RegisterDataType.FLOAT32), new ModbusRegister(6, 1, RegisterDataType.UINT32)];
        device.addHoldingRegisters(holdingRegisters);

        const inputRegisters = [new ModbusRegister(1, 1, RegisterDataType.UINT16), new ModbusRegister(2, 1, RegisterDataType.UINT16)];
        device.addInputRegisters(inputRegisters);

        expect(device.getRegisterByTypeAndAddress(RegisterType.Input, 1)).toBe(inputRegisters[0]);
        expect(device.getRegisterByTypeAndAddress(RegisterType.Holding, 5)).toBe(holdingRegisters[0]);
        expect(device.getRegisterByTypeAndAddress(RegisterType.Input, 9999)).toBeUndefined();
        expect(device.getRegisterByTypeAndAddress(RegisterType.Holding, 9999)).toBeUndefined();
    });
});
