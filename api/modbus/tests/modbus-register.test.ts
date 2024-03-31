import { AccessMode } from '../models/enum/access-mode';
import { RegisterDataType } from '../models/enum/register-datatype';
import { ModbusRegister } from '../models/modbus-register';

describe('modbus-register', () => {
    test('default initializer', async () => {
        const modbusRegister = ModbusRegister.default('measure_power.load', 653, 1, RegisterDataType.INT16);
        expect(modbusRegister.address).toBe(653);
        expect(modbusRegister.length).toBe(1);
        expect(modbusRegister.dataType).toBe(RegisterDataType.INT16);
        expect(modbusRegister.capabilityId).toBe('measure_power.load');
        expect(modbusRegister.accessMode).toBe(AccessMode.ReadOnly);

        const calculateValue = modbusRegister.calculateValue(123);
        expect(calculateValue).toBe(123);
    });

    test('transform initializer', async () => {
        const transformation = (value: any) => {
            return value === 1 ? 'Yes' : 'No';
        };

        const modbusRegister = ModbusRegister.transform('status_text.sell_solar', 145, 1, RegisterDataType.UINT16, transformation, AccessMode.ReadWrite);
        expect(modbusRegister.address).toBe(145);
        expect(modbusRegister.length).toBe(1);
        expect(modbusRegister.dataType).toBe(RegisterDataType.UINT16);
        expect(modbusRegister.capabilityId).toBe('status_text.sell_solar');
        expect(modbusRegister.accessMode).toBe(AccessMode.ReadWrite);

        expect(modbusRegister.calculateValue(1)).toBe('Yes');
        expect(modbusRegister.calculateValue(0)).toBe('No');
    });

    test('scale initializer', async () => {
        const modbusRegister = ModbusRegister.scale('measure_power.total_pv', 534, 2, RegisterDataType.UINT16, 0.1);
        expect(modbusRegister.address).toBe(534);
        expect(modbusRegister.length).toBe(2);
        expect(modbusRegister.dataType).toBe(RegisterDataType.UINT16);
        expect(modbusRegister.capabilityId).toBe('measure_power.total_pv');
        expect(modbusRegister.accessMode).toBe(AccessMode.ReadOnly);
        expect(modbusRegister.scale).toBe(0.1);

        expect(modbusRegister.calculateValue(123)).toBe(12.3);
        expect(modbusRegister.calculateValue(2500)).toBe(250);
    });
});
