import fetch from 'node-fetch';

import { API } from '../api';
import { Logger } from '../log';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
    data: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
    success: true,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('get-user-token', () => {
    test('headers are successfully set', async () => {
        const api = new API(new Logger());
        api.setAuthenticationInfo('mockedAccessId', 'mockedAccessSecret');

        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        await api.getUserToken();

        const expectedHeaders = {
            'Content-Type': 'application/json',
            'Access-Id': 'mockedAccessId',
            'Access-Secret': 'mockedAccessSecret',
            Accept: '*/*',
        };

        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/v1/user/token',
            { body: '{}', headers: expectedHeaders, method: 'post' },
        );

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('succesfully get a user token', async () => {
        const api = new API(new Logger());
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.getUserToken();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(api.userToken).toBe('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9');
        expect(result).toBe(true);
    });

    test('fail to get a user token', async () => {
        const api = new API(new Logger());
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const result = await api.getUserToken();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(api.userToken).toBe('');
        expect(result).toBe(false);
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
