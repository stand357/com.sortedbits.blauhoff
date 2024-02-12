import { RegisterDataType } from './register-datatype';

export class ModbusRegister {

    address: number;
    length: number
    dataType: RegisterDataType;
    scale: number;
    capabilityId: string;

    constructor(address: number, length: number, dataType: RegisterDataType, scale: number, capabilityId: string) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.scale = scale;
        this.capabilityId = capabilityId;
    }

    calculateValue(value: any): any {
        if (Number(value) && this.scale !== 0) {
            return value * this.scale;
        }
        return value;
    }

}
