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

export class ModbusRegisterParseConfiguration {
    capabilityId: string;

    transformation?: Transformation;
    scale?: number;

    constructor(capabilityId: string, transformation?: Transformation, scale?: number) {
        this.capabilityId = capabilityId;
        this.transformation = transformation;
        this.scale = scale;
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

export class ModbusRegister {
    address: number;
    length: number;
    dataType: RegisterDataType;
    accessMode: AccessMode;

    parseConfigurations: ModbusRegisterParseConfiguration[] = [];

    constructor(address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.accessMode = accessMode;
    }

    addDefault = (capabilityId: string): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(capabilityId);
        this.parseConfigurations.push(configuration);
        return this;
    };

    addScale = (capabilityId: string, scale: number): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(capabilityId, undefined, scale);
        this.parseConfigurations.push(configuration);
        return this;
    };

    addTransform = (capabilityId: string, transformation: Transformation): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(capabilityId, transformation);
        this.parseConfigurations.push(configuration);
        return this;
    };

    calculateValue(value: any, buffer: Buffer, log: IBaseLogger): any {
        if (this.parseConfigurations.length !== 1) {
            throw new Error('Invalid number of parse configurations for this method to work');
        }

        const parseConfiguration = this.parseConfigurations[0];
        return parseConfiguration.calculateValue(value, buffer, log);
    }

    calculatePayload(value: any, log: IBaseLogger): any {
        if (this.parseConfigurations.length !== 1) {
            throw new Error('Invalid number of parse configurations for this method to work');
        }

        const parseConfiguration = this.parseConfigurations[0];
        return parseConfiguration.calculatePayload(value, log);
    }

    static transform(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        transformation: Transformation,
        accessMode: AccessMode = AccessMode.ReadOnly,
    ) {
        return new ModbusRegister(address, length, dataType, accessMode).addTransform(capabilityId, transformation);
    }

    static default(capabilityId: string, address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly) {
        return new ModbusRegister(address, length, dataType, accessMode).addDefault(capabilityId);
    }

    static scale(
        capabilityId: string,
        address: number,
        length: number,
        dataType: RegisterDataType,
        scale: number,
        accessMode: AccessMode = AccessMode.ReadOnly,
    ) {
        return new ModbusRegister(address, length, dataType, accessMode).addScale(capabilityId, scale);
    }
}
