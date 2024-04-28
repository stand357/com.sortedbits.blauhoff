/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IBaseLogger } from '../../../../helpers/log';
import { defaultValueConverter } from '../../device-repository/_shared/default-value-converter';
import { ModbusAPI } from '../../modbus-api';
import { Brand } from '../enum/brand';
import { ModbusRegister } from '../modbus-register';
import { SupportedFlowTypes } from '../supported-flow-types';
import { ModbusDeviceDefinition } from './modbus-device-registers';

interface SupportedFlows {
    actions?: {
        [id in SupportedFlowTypes]?: (origin: IBaseLogger, args: any, client: ModbusAPI) => Promise<void>;
    };
}

export interface IDeviceModel {
    definition: ModbusDeviceDefinition;
    supportedFlows?: SupportedFlows;
}

export class DeviceModel {
    readonly id: string;
    readonly brand: Brand;
    readonly name: string;
    readonly description: string;
    readonly debug: boolean;

    inputRegisters: ModbusRegister[] = [];
    holdingRegisters: ModbusRegister[] = [];
    deprecatedCapabilities: string[] = [];

    supportedFlows: SupportedFlows = {};

    readonly valueConverter = defaultValueConverter;

    static fromDeviceModel(model: DeviceModel): DeviceModel {
        return new DeviceModel(model.id, model.brand, model.name, model.description, model.debug)
            .setInputRegisters(model.inputRegisters)
            .setHoldingRegisters(model.holdingRegisters)
            .setDeprecatedCapabilities(model.deprecatedCapabilities)
            .setSupportedFlowTypes(model.supportedFlows);
    }

    constructor(id: string, brand: Brand, modelName: string, description: string, debug: boolean = false) {
        this.id = id;
        this.brand = brand;
        this.name = modelName;
        this.description = description;
        this.debug = debug;
    }

    setInputRegisters(registers: ModbusRegister[]): DeviceModel {
        this.inputRegisters = registers;
        return this;
    }

    setHoldingRegisters(registers: ModbusRegister[]): DeviceModel {
        this.holdingRegisters = registers;
        return this;
    }

    setDeprecatedCapabilities(capabilities: string[]): DeviceModel {
        this.deprecatedCapabilities = capabilities;
        return this;
    }

    setSupportedFlowType(flowType: SupportedFlowTypes, action: (origin: IBaseLogger, args: any, client: ModbusAPI) => Promise<void>): DeviceModel {
        if (!this.supportedFlows.actions) {
            this.supportedFlows.actions = {};
        }

        this.supportedFlows.actions[flowType] = action;
        return this;
    }

    setSupportedFlowTypes(actions: SupportedFlows): DeviceModel {
        this.supportedFlows = actions;
        return this;
    }
}
