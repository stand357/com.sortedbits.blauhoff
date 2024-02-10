import { getDefinition, getDeviceModel, getModelsForBrand } from '../helpers/get-definition';
import { Brand } from '../models/brand';

describe('definition', () => {
    test('get models for brand', async () => {
        const response = getModelsForBrand(Brand.Blauhoff);
        expect(response).toBeDefined();
        expect(response.length).toBe(1);

        const model = response[0];

        expect(model.id).toBe('blauhoff-1');
        expect(model.debug).toBe(false);
        expect(model.getDefinition).toBeDefined();
    });

    test('growatt devices to have debug enabled', async () => {
        const response = getModelsForBrand(Brand.Growatt);

        const debugValues = response.map((model) => model.debug);
        const allDebugs = debugValues.every((value) => value === true);

        expect(allDebugs).toBe(true);
    });

    test('getDeviceModel with existing model', async () => {
        const response = getModelsForBrand(Brand.Blauhoff);
        expect(response.length).toBeGreaterThan(0);
        const model = response[0];

        const queryModel = getDeviceModel(Brand.Blauhoff, model.id);

        expect(queryModel).toBeDefined();
        expect(queryModel).toEqual(model);
    });

    test('getDeviceModel with non existing model', async () => {
        const model = getDeviceModel(Brand.Blauhoff, 'non-existing-model');
        expect(model).toBeUndefined();
    });

    test('getDefinition with existing model', async () => {
        const definition = getDefinition(Brand.Blauhoff, 'blauhoff-1');
        expect(definition).toBeDefined();
    });

    test('getDefinition with non existing model', async () => {
        const definition = getDefinition(Brand.Blauhoff, 'non-existing-model');
        expect(definition).toBeUndefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
