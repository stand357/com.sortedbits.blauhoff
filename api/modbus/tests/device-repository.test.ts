import { DeviceRepository } from '../../../repositories/device-repository/device-repository';
import { Brand } from '../../../repositories/device-repository/models/enum/brand';

describe('device-repository', () => {
    test('get models for brand', async () => {
        const response = DeviceRepository.getInstance().getDevicesByBrand(Brand.Deye);
        expect(response).toBeDefined();
        expect(response.length).toBe(1);

        const model = response[0];

        expect(model.id).toBe('deye-sun-xk-sg01hp3-eu-am2');
        expect(model.inputRegisters).toBeDefined();
    });

    test('getDeviceModel with existing model', async () => {
        const response = DeviceRepository.getInstance().getDevicesByBrand(Brand.Deye);
        expect(response.length).toBeGreaterThan(0);
        const model = response[0];

        const queryModel = DeviceRepository.getInstance().getDeviceById(model.id);

        expect(queryModel).toBeDefined();
        expect(queryModel?.brand).toBe(Brand.Deye);
        expect(queryModel).toEqual(model);
    });

    test('getDeviceModel with non existing model', async () => {
        const model = DeviceRepository.getInstance().getDeviceById('non-existing-model');
        expect(model).toBeUndefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
