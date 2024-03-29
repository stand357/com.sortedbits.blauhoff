import { DeviceRepository } from '../device-repository/device-repository';
import { Brand } from '../models/brand';

describe('device-repository', () => {
    test('get models for brand', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.BlauHoff);
        expect(response).toBeDefined();
        expect(response.length).toBe(1);

        const model = response[0];

        expect(model.id).toBe('blauhoff-1');
        expect(model.debug).toBe(false);
        expect(model.definition).toBeDefined();
    });

    test('growatt devices to have debug enabled', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.Growatt);

        const debugValues = response.map((model) => model.debug);
        const allDebugs = debugValues.every((value) => value === true);

        expect(allDebugs).toBe(true);
    });

    test('getDeviceModel with existing model', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.BlauHoff);
        expect(response.length).toBeGreaterThan(0);
        const model = response[0];

        const queryModel = DeviceRepository.getDeviceByBrandAndModel(Brand.BlauHoff, model.id);

        expect(queryModel).toBeDefined();
        expect(queryModel).toEqual(model);
    });

    test('getDeviceModel with non existing model', async () => {
        const model = DeviceRepository.getDeviceByBrandAndModel(Brand.BlauHoff, 'non-existing-model');
        expect(model).toBeUndefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
