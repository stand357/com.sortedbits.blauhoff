import fetch from 'node-fetch';

import { API } from '../blauhoff';
import { Logger } from '../log';
import { GetDeviceListResponse } from '../mock/responses/get-device-list';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('get-device-list', () => {
    test('Fetch a single page of items', async () => {
        const api = new API(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(
                new GetDeviceListResponse().successObject,
            )),
        );

        const response = await api.queryDeviceList();

        expect(response).toStrictEqual([
            {
                serial: 'SHA602131202215005',
                model: 'SPHA6.0H-10.24kW',
                id: '1678686019714682881',
            },
            {
                serial: 'SHA602131202215004',
                model: 'SPHA6.0H-10.24kW',
                id: '1678686019714682880',
            },
        ]);
    });

    test('Fail fetching items', async () => {
        const api = new API(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(
                new GetDeviceListResponse().failObject,
            )),
        );

        const response = await api.queryDeviceList();

        expect(response).toStrictEqual([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
