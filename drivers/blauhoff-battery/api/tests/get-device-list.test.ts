import fetch from 'node-fetch';

import { API } from '../blauhoff';
import { Logger } from '../log';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
    data: {
        totalPages: 1,
        totalCount: 2,
        data: [
            {
                deviceSn: 'SHA602131202215005',
                deviceModel: 'SPHA6.0H-10.24kW',
                state: 0,
                id: '1678686019714682881',
            },
            {
                deviceSn: 'SHA602131202215004',
                deviceModel: 'SPHA6.0H-10.24kW',
                state: 0,
                id: '1678686019714682880',
            },
        ],
    },
    success: true,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('get-device-list', () => {
    test('Fetch a single page of items', async () => {
        const api = new API(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
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
            new Response(JSON.stringify(failObject)),
        );

        const response = await api.queryDeviceList();

        expect(response).toStrictEqual([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
