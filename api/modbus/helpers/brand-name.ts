/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { DeviceRepository } from '../../device-repository/device-repository';
import { Brand } from '../models/enum/brand';

/**
 * Returns the corresponding Brand based on the provided brandName string.
 * @param brandName - The brand name string.
 * @returns The corresponding Brand enum value, or undefined if no match is found.
 */
export const getBrand = (brandName: string): Brand | undefined => {
    switch (brandName.toLocaleLowerCase()) {
        case 'growatt':
            return Brand.Growatt;
        case 'afore':
            return Brand.Afore;
        case 'deye':
            return Brand.Deye;
        default:
            return undefined;
    }
};

/**
 * Retrieves the device model name based on the brand name and model ID.
 * If the model is found, returns the model name.
 * If the model is not found, returns a string indicating an unknown device of the specified brand.
 * @param brandName - The brand name of the device.
 * @param modelId - The model ID of the device.
 * @returns The device model name or a string indicating an unknown device.
 */
export const getDeviceModelName = (brandName: Brand, modelId: string): string => {
    const model = DeviceRepository.getDeviceByBrandAndModel(brandName, modelId);

    if (model) {
        return model.name;
    }

    const output = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return `Unknown ${output} device`;
};

/**
 * Returns the icon file name for a given brand.
 * @param brandName - The brand name.
 * @returns The icon file name.
 */
export const iconForBrand = (brandName: Brand): string => {
    switch (brandName) {
        case Brand.Growatt:
        case Brand.Afore:
        case Brand.Deye:
            return `${brandName}-device.svg`;
        default:
            return 'icon.svg';
    }
};
