/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { RegisterDataType } from './register-datatype';

export type Transformation = (value: any) => any;

export class ModbusRegister {

    address: number;
    length: number
    dataType: RegisterDataType;
    scale?: number;
    capabilityId: string;
    transformation?: Transformation;

    static default(capabilityId: string, address: number, length: number, dataType: RegisterDataType) {
        return new ModbusRegister(capabilityId, address, length, dataType);
    }

    static transform(capabilityId: string, address: number, length: number, dataType: RegisterDataType, transformation: Transformation) {
        return new ModbusRegister(capabilityId, address, length, dataType, undefined, transformation);
    }

    static scale(capabilityId: string, address: number, length: number, dataType: RegisterDataType, scale: number) {
        return new ModbusRegister(capabilityId, address, length, dataType, scale);
    }

    constructor(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        scale?: number,
        transformation?: Transformation,
    ) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.capabilityId = capabilityId;
        this.scale = scale;
        this.transformation = transformation;
    }

    calculateValue(value: any): any {
        let result = (Number(value) && this.scale) ? value * this.scale : value;

        if (this.transformation) {
            result = this.transformation(result);
        }

        return result;
    }

}
