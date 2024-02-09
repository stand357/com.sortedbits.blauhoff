import { DeviceType } from '../models/device-type';

/**
 * Returns the corresponding DeviceType based on the provided deviceType string.
 * @param deviceType - The device type string.
 * @returns The corresponding DeviceType enum value, or undefined if no match is found.
 */
export const getDeviceType = (deviceType: string): DeviceType | undefined => {
    switch (deviceType) {
        case 'blauhoff':
            return DeviceType.Blauhoff;
        case 'growatt':
            return DeviceType.Growatt;
        default:
            return undefined;
    }
};

export const nameForDeviceType = (deviceType: DeviceType): string => {
    switch (deviceType) {
        case DeviceType.Blauhoff:
            return 'Blauhoff device';
        case DeviceType.Growatt:
            return 'Growatt debug device';
        case DeviceType.Kstar:
            return 'Kstar device';
        case DeviceType.Deye:
            return 'Deye device';
        default:
            return 'Unknown device';
    }
};

export const iconForDeviceType = (deviceType: DeviceType): string => {
    switch (deviceType) {
        case DeviceType.Blauhoff:
            return 'blauhoff-device.svg';
        case DeviceType.Growatt:
            return 'growatt-device.svg';
        case DeviceType.Kstar:
            return 'kstar-device.svg';
        case DeviceType.Deye:
            return 'deye-device.svg';
        default:
            return 'icon.svg';
    }
};
