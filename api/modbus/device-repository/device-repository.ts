import { Brand } from '../models/brand';
import { DeviceModel } from '../models/device-model';
import { blauhoffSPHA } from './blauhoff/spha';
import { growattTL } from './growatt/mod-XXXX-tl';
import { growattTL3 } from './growatt/mod-XXXX-tl3';

export class DeviceRepository {

    private static devices: DeviceModel[] = [
        blauhoffSPHA,
        growattTL,
        growattTL3,
    ];

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
