import { RegisterCalculation } from './register-calculation';
import { RegisterDataType } from './register-datatype';

export class ModbusRegister {

    address: number;
    length: number
    dataType: RegisterDataType;
    scale: number;
    capabilityId: string;
    calculation: RegisterCalculation;
    multiplier: number;

    constructor(address: number, length: number, dataType: RegisterDataType, scale: number, capabilityId: string, calculation: RegisterCalculation, multiplier: number) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.scale = scale;
        this.capabilityId = capabilityId;
        this.calculation = calculation;
        this.multiplier = multiplier;
    }

}
