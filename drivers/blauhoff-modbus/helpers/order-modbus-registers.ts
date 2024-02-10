import { ModbusRegister } from '../../../api/modbus/models/modbus-register';

export const orderModbusRegisters = (registers: ModbusRegister[]) => {
    return registers.sort((a, b) => a.address - b.address);
};
