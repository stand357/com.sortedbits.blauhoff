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

    const output = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return `Unknown ${output} device`;
};

export const iconForBrand = (brandName: Brand): string => {
    switch (brandName) {
        case Brand.Blauhoff:
        case Brand.Growatt:
        case Brand.Kstar:
        case Brand.Deye:
            return `${brandName}-device.svg`;
        default:
            return 'icon.svg';
    }
};
