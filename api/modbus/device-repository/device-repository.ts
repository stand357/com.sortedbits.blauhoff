/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { Brand } from '../models/enum/brand';
import { DeviceModel } from '../models/device-model';
import { aforeAFXKTH } from './afore/af-xk-th-three-phase-hybrid';
import { blauhoffSPHA } from './blauhoff/spha';
import { deyeSunXKSG01HP3 } from './deye/sun-xk-sg01hp3-eu-am2';
import { growattTL } from './growatt/mod-XXXX-tl';
import { growattTL3 } from './growatt/mod-XXXX-tl3';

export class DeviceRepository {
    private static devices: DeviceModel[] = [blauhoffSPHA, growattTL, growattTL3, deyeSunXKSG01HP3, aforeAFXKTH];

    public static getDevices(): DeviceModel[] {
        return this.devices;
    }

    public static getDeviceById(id: string): DeviceModel | undefined {
        return this.devices.find((device) => device.id === id);
    }

    public static getDevicesByBrand(brand: Brand): DeviceModel[] {
        return this.devices.filter((device) => device.brand === brand);
    }

    public static getDeviceByBrandAndModel(brand: Brand, model: string): DeviceModel | undefined {
        return this.devices.find((device) => device.brand === brand && device.id === model);
    }
}
