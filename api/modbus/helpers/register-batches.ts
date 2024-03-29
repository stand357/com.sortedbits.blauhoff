import { ModbusRegister } from '../models/modbus-register';
import { orderModbusRegisters } from './order-modbus-registers';
import { IBaseLogger } from '../../../helpers/log';

export const createRegisterBatches = (log: IBaseLogger, registers: ModbusRegister[]): ModbusRegister[][] => {
    if (registers.length === 0) {
        return [];
    }

    const ordered = orderModbusRegisters(registers);
    const batches: ModbusRegister[][] = [];

    const firstAddress = ordered[0].address;

    let batch: ModbusRegister[] = [];

    let nextAddress = firstAddress;

    for (const register of ordered) {
        if (register.address !== nextAddress) {
            batches.push(batch);
            batch = [];
        }

        batch.push(register);
        nextAddress = register.address + register.length;
    }

    batches.push(batch);

    return batches;
};
