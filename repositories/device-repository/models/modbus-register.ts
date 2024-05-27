/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { randomUUID } from 'crypto';
import { IBaseLogger } from '../../../helpers/log';
import { AccessMode } from './enum/access-mode';
import { RegisterDataType } from './enum/register-datatype';
import { RegisterType } from './enum/register-type';

export type Transformation = (value: any, buffer: Buffer, log: IBaseLogger) => any;

export interface ModbusRegisterOptions {
    validValueMin?: number;
    validValueMax?: number;
}

export class ModbusRegisterParseConfiguration {
    register: ModbusRegister;
    capabilityId: string;
    transformation?: Transformation;
    scale?: number;
    guid: string;
    options: ModbusRegisterOptions;

    constructor(register: ModbusRegister, capabilityId: string, transformation?: Transformation, scale?: number, options: ModbusRegisterOptions = {}) {
        this.register = register;
        this.capabilityId = capabilityId;
        this.transformation = transformation;
        this.scale = scale;
        this.options = options;

        this.guid = randomUUID();
    }

    calculateValue(value: any, buffer: Buffer, log: IBaseLogger): any {
        if (this.scale) {
            const numberValue = parseFloat(value);

            if (isNaN(numberValue)) {
                return value;
            }

            return numberValue * this.scale;
        }

        if (this.transformation) {
            return this.transformation(value, buffer, log);
        }

        return value;
    }
    calculatePayload(value: any, log: IBaseLogger): any {
        const result = Number(value) && this.scale ? value / this.scale : value;

        return result;
    }

    validateValue(value: any): boolean {
        if (this.register.dataType === RegisterDataType.STRING) {
            return true;
        }

        if (this.options.validValueMax === undefined && this.options.validValueMin === undefined) {
            return true;
        }

        if (isNaN(parseFloat(value))) {
            return false;
        }

        if (this.options.validValueMax !== undefined && value > this.options.validValueMax) {
            return false;
        }

        if (this.options.validValueMin !== undefined && value < this.options.validValueMin) {
            return false;
        }

        return true;
    }
}

export class ModbusRegister {
    address: number;
    length: number;
    dataType: RegisterDataType;
    accessMode: AccessMode;

    registerType: RegisterType = RegisterType.Input;

    parseConfigurations: ModbusRegisterParseConfiguration[] = [];

    constructor(address: number, length: number, dataType: RegisterDataType, accessMode: AccessMode = AccessMode.ReadOnly) {
        this.address = address;
        this.length = length;
        this.dataType = dataType;
        this.accessMode = accessMode;
    }

    addDefault = (capabilityId: string, options?: ModbusRegisterOptions): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(this, capabilityId);
        this.parseConfigurations.push(configuration);
        return this;
    };

    addScale = (capabilityId: string, scale: number, options?: ModbusRegisterOptions): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(this, capabilityId, undefined, scale);
        this.parseConfigurations.push(configuration);
        return this;
    };

    addTransform = (capabilityId: string, transformation: Transformation, options?: ModbusRegisterOptions): ModbusRegister => {
        const configuration = new ModbusRegisterParseConfiguration(this, capabilityId, transformation);
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
        options: ModbusRegisterOptions = {},
    ) {
        return new ModbusRegister(address, length, dataType, accessMode).addTransform(capabilityId, transformation, options);
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
        options: ModbusRegisterOptions = {},
    ) {
        return new ModbusRegister(address, length, dataType, accessMode).addScale(capabilityId, scale, options);
    }
}
