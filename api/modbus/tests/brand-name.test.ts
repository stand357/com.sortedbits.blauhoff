import { getBrand, getDeviceModelName, iconForBrand } from '../../../repositories/device-repository/helpers/brand-name';
import { Brand } from '../../../repositories/device-repository/models/enum/brand';

describe('brand-name', () => {
    test('get-brand with existing name', async () => {
        const growatt = getBrand('growatt');
        expect(growatt).toBe(Brand.Growatt);
    });

    test('get-brand with non existing name', async () => {
        const response = getBrand('some-non-existing-name');
        expect(response).toBeUndefined();
    });

    test('get-device-model-name with existing model', async () => {
        const model = getDeviceModelName(Brand.Deye, 'deye-sun-xk-sg01hp3-eu-am2');
        expect(model).toBe('Deye Sun *K SG01HP3 EU AM2 Series');
    });

    test('get-device-model-name with non existing model', async () => {
        const blauhoff = getDeviceModelName(Brand.Deye, 'non existing model');
        expect(blauhoff).toBe('Unknown Deye device');

        const kstar = getDeviceModelName(Brand.Afore, 'non existing model');
        expect(kstar).toBe('Unknown Afore device');
    });

    test('icon-for-brand', async () => {
        const afore = iconForBrand(Brand.Afore);
        expect(afore).toBe('afore-device.svg');

        const deye = iconForBrand(Brand.Deye);
        expect(deye).toBe('deye-device.svg');
    });
});
