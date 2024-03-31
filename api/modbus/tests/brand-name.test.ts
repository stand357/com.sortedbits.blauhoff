import { getBrand, getDeviceModelName, iconForBrand } from '../helpers/brand-name';
import { Brand } from '../models/enum/brand';

describe('brand-name', () => {
    test('get-brand with existing name', async () => {
        const blauhoff = getBrand('blauhoff');
        expect(blauhoff).toBe(Brand.BlauHoff);

        const growatt = getBrand('growatt');
        expect(growatt).toBe(Brand.Growatt);
    });

    test('get-brand with non existing name', async () => {
        const response = getBrand('some-non-existing-name');
        expect(response).toBeUndefined();
    });

    test('get-device-model-name with existing model', async () => {
        const model = getDeviceModelName(Brand.BlauHoff, 'blauhoff-1');
        expect(model).toBe('BlauHoff SPHA');
    });

    test('get-device-model-name with non existing model', async () => {
        const blauhoff = getDeviceModelName(Brand.BlauHoff, 'non existing model');
        expect(blauhoff).toBe('Unknown Blauhoff device');

        const kstar = getDeviceModelName(Brand.Afore, 'non existing model');
        expect(kstar).toBe('Unknown Afore device');
    });

    test('icon-for-brand', async () => {
        const blauhoff = iconForBrand(Brand.BlauHoff);
        expect(blauhoff).toBe('blauhoff-device.svg');

        const kstar = iconForBrand(Brand.Afore);
        expect(kstar).toBe('afore-device.svg');

        const deye = iconForBrand(Brand.Deye);
        expect(deye).toBe('deye-device.svg');
    });
});
