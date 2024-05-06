/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { AforeAFXKTH } from './devices/afore/af-xk-th-three-phase-hybrid/af-xk-th-three-phase-hybrid';
import { DeyeSunXKSG01HP3 } from './devices/deye/sun-xk-sg01hp3-eu-am2/sun-xk-sg01hp3-eu-am2';
import { GrowattTLX } from './devices/growatt/growatt-tl/mic-XXXX-tl';
import { GrowattTL3X } from './devices/growatt/growatt-tl3/mod-XXXX-tl3';
import { DeviceInformation } from './models/device-information';
import { Brand } from './models/enum/brand';
import { RegisterType } from './models/enum/register-type';
import { ModbusRegister } from './models/modbus-register';

export class DeviceRepository {
    private static instance: DeviceRepository;

    public static getInstance(): DeviceRepository {
        if (!this.instance) {
            this.instance = new DeviceRepository();
        }

        return this.instance;
    }

    private devices: DeviceInformation[] = [];

    constructor() {
        this.devices.push(new AforeAFXKTH());
        this.devices.push(new DeyeSunXKSG01HP3());
        this.devices.push(new GrowattTLX());
        this.devices.push(new GrowattTL3X());

        /* When adding a new device, make sure to add it to the devices array */
    }

    public getDeviceById(id: string): DeviceInformation | undefined {
        return this.devices.find((device) => device.id === id);
    }

    public getDevicesByBrand(brand: Brand): DeviceInformation[] {
        return this.devices.filter((device) => device.brand === brand);
    }

    public getRegisteryTypeAndAddress(device: DeviceInformation, type: RegisterType, address: number): ModbusRegister | undefined {
        return device.getRegisterByTypeAndAddress(type, address);
    }
}
