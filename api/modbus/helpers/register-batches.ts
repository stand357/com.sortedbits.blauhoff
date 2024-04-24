import { ModbusRegister } from '../models/modbus-register';
import { orderModbusRegisters } from './order-modbus-registers';
import { IBaseLogger } from '../../../helpers/log';
import { AccessMode } from '../models/enum/access-mode';

/**
 * Create register batches for the given registers. This to  elimintate the amount of addresses that need to be read.
 *
 * @param log The logger
 * @param registers The registers
 */
export const createRegisterBatches = (log: IBaseLogger, registers: ModbusRegister[]): ModbusRegister[][] => {
    const filteredRegisters = registers.filter((register) => register.accessMode !== AccessMode.WriteOnly);

    if (filteredRegisters.length === 0) {
        return [];
    }

    const ordered = orderModbusRegisters(filteredRegisters);
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
