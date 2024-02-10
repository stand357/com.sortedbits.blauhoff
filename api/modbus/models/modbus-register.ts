import { RegisterCalculation } from './register-calculation';
import { RegisterDataType } from './register-datatype';

export class ModbusRegister {

    address: number;
    length: number
    dataType: RegisterDataType;
    scale: number;
    capabilityId: string;
    calculation: RegisterCalculation;

    constructor(address: number, length: number, dataType: RegisterDataType, scale: number, capabilityId: string, calculation: RegisterCalculation) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.scale = scale;
        this.capabilityId = capabilityId;
        this.calculation = calculation;
    }

    calculateValue(value: any): any {
        if (Number(value) && this.scale !== 0) {
            return value * this.scale;
        }
        return value;
    }

}
