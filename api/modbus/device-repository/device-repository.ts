/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { IDeviceModel } from '../models/device/device-model';
import { Brand } from '../models/enum/brand';
import { ModbusRegister } from '../models/modbus-register';
import { aforeAFXKTH } from './afore/af-xk-th-three-phase-hybrid';
import { deyeSunXKSG01HP3 } from './deye/sun-xk-sg01hp3-eu-am2';
import { growattTL } from './growatt/mod-XXXX-tl';
import { growattTL3 } from './growatt/mod-XXXX-tl3';

export class DeviceRepository {
    private static devices: IDeviceModel[] = [growattTL, growattTL3, deyeSunXKSG01HP3, aforeAFXKTH];

    public static getDevices(): IDeviceModel[] {
        return this.devices;
    }

    public static getDeviceById(id: string): IDeviceModel | undefined {
        return this.devices.find((device) => device.id === id);
    }

    public static getDevicesByBrand(brand: Brand): IDeviceModel[] {
        return this.devices.filter((device) => device.brand === brand);
    }

    public static getDeviceByBrandAndModel(brand: Brand, model: string): IDeviceModel | undefined {
        return this.devices.find((device) => device.brand === brand && device.id === model);
    }

    public static getRegisterByTypeAndAddress(device: IDeviceModel, type: string, address: number): ModbusRegister | undefined {
        switch (type) {
            case 'input':
                return device.definition.inputRegisters.find((register) => register.address === address);
            case 'holding':
                return device.definition.holdingRegisters.find((register) => register.address === address);
            default:
                return undefined;
        }
    }
}
