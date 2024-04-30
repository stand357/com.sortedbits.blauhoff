/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IBaseLogger } from '../../../helpers/log';
import { AccessMode } from './enum/access-mode';
import { RegisterDataType } from './enum/register-datatype';

export type Transformation = (value: any, buffer: Buffer, log: IBaseLogger) => any;

export class ModbusRegister {
    address: number;
    length: number;
    dataType: RegisterDataType;
    scale?: number;
    capabilityId: string;
    transformation?: Transformation;
    accessMode: AccessMode;

    static default(capabilityId: string, address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly) {
        return new ModbusRegister(capabilityId, address, length, dataType, accessMode);
    }

    static transform(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        transformation: Transformation,
        accessMode: AccessMode = AccessMode.ReadOnly,
    ) {
        return new ModbusRegister(capabilityId, address, length, dataType, accessMode, undefined, transformation);
    }

    static scale(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        scale: number,
        accessMode: AccessMode = AccessMode.ReadOnly,
    ) {
        return new ModbusRegister(capabilityId, address, length, dataType, accessMode, scale);
    }

    constructor(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        accessMode: AccessMode,
        scale?: number,
        transformation?: Transformation,
    ) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.capabilityId = capabilityId;
        this.scale = scale;
        this.transformation = transformation;
        this.accessMode = accessMode;
    }

    calculateValue(value: any, buffer: Buffer, log: IBaseLogger): any {
        let result = Number(value) && this.scale ? value * this.scale : value;

        if (this.transformation) {
            result = this.transformation(result, buffer, log);
        }

        return result;
    }

    calculatePayload(value: any, log: IBaseLogger): any {
        const result = Number(value) && this.scale ? value / this.scale : value;

        return result;
    }
}
