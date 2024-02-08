import { RegisterCalculation } from './register-calculation';
import { RegisterDataType } from './register-datatype';

export interface ModbusRegister {
    address: number;
    length: number
    dataType: RegisterDataType;
    scale: number,
    capabilityId: string,
    calculation: RegisterCalculation,
    unit: string,
    multiplier: number,
}
