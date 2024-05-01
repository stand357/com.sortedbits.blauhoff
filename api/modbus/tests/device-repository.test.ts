import { DeviceRepository } from '../../../repositories/device-repository/device-repository';
import { Brand } from '../../../repositories/device-repository/models/enum/brand';

describe('device-repository', () => {
    test('get models for brand', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.Deye);
        expect(response).toBeDefined();
        expect(response.length).toBe(1);

        const model = response[0];

        expect(model.id).toBe('deye-sun-xk-sg01hp3-eu-am2');
        expect(model.debug).toBe(true);
        expect(model.definition).toBeDefined();
    });

    test('growatt devices to have debug enabled', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.Growatt);

        const debugValues = response.map((model) => model.debug);
        const allDebugs = debugValues.every((value) => value === true);

        expect(allDebugs).toBe(true);
    });

    test('getDeviceModel with existing model', async () => {
        const response = DeviceRepository.getDevicesByBrand(Brand.Deye);
        expect(response.length).toBeGreaterThan(0);
        const model = response[0];

        const queryModel = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, model.id);

        expect(queryModel).toBeDefined();
        expect(queryModel).toEqual(model);
    });

    test('getDeviceModel with non existing model', async () => {
        const model = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, 'non-existing-model');
        expect(model).toBeUndefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
