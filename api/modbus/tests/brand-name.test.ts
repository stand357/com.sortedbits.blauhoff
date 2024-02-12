import { getBrand, getDeviceModelName, iconForBrand } from '../helpers/brand-name';
import { Brand } from '../models/brand';

describe('brand-name', () => {
    test('get-brand with existing name', async () => {
        const blauhoff = getBrand('blauhoff');
        expect(blauhoff).toBe(Brand.Blauhoff);

        const growatt = getBrand('growatt');
        expect(growatt).toBe(Brand.Growatt);
    });

    test('get-brand with non existing name', async () => {
        const response = getBrand('some-non-existing-name');
        expect(response).toBeUndefined();
    });

    test('get-device-model-name with existing model', async () => {
        const model = getDeviceModelName(Brand.Blauhoff, 'blauhoff-1');
        expect(model).toBe('Blauhoff SPHA');
    });

    test('get-device-model-name with non existing model', async () => {
        const blauhoff = getDeviceModelName(Brand.Blauhoff, 'non existing model');
        expect(blauhoff).toBe('Unknown Blauhoff device');

        const kstar = getDeviceModelName(Brand.Kstar, 'non existing model');
        expect(kstar).toBe('Unknown Kstar device');
    });

    test('icon-for-brand', async () => {
        const blauhoff = iconForBrand(Brand.Blauhoff);
        expect(blauhoff).toBe('blauhoff-device.svg');

        const kstar = iconForBrand(Brand.Kstar);
        expect(kstar).toBe('kstar-device.svg');

        const deye = iconForBrand(Brand.Deye);
        expect(deye).toBe('deye-device.svg');
    });
});
