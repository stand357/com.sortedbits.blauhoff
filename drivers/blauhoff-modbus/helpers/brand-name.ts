import { Brand } from '../models/brand';
import { getDeviceModel } from './get-definition';

/**
 * Returns the corresponding Brand based on the provided brandName string.
 * @param brandName - The brand name string.
 * @returns The corresponding Brand enum value, or undefined if no match is found.
 */
export const getBrand = (brandName: string): Brand | undefined => {
    switch (brandName) {
        case 'blauhoff':
            return Brand.Blauhoff;
        case 'growatt':
            return Brand.Growatt;
        default:
            return undefined;
    }
};

export const getDeviceModelName = (brandName: Brand, modelId: string): string => {
    const model = getDeviceModel(brandName, modelId);

    if (model) {
        return model.name;
    }

    switch (brandName) {
        case Brand.Blauhoff:
            return 'Unknown Blauhoff device';
        case Brand.Growatt:
            return 'Unknown Growatt debug device';
        case Brand.Kstar:
            return 'Unknown Kstar device';
        case Brand.Deye:
            return 'Unknown Deye device';
        default:
            return 'Unknown device';
    }
};

export const iconForBrand = (brandName: Brand): string => {
    switch (brandName) {
        case Brand.Blauhoff:
            return 'blauhoff-device.svg';
        case Brand.Growatt:
            return 'growatt-device.svg';
        case Brand.Kstar:
            return 'kstar-device.svg';
        case Brand.Deye:
            return 'deye-device.svg';
        default:
            return 'icon.svg';
    }
};
