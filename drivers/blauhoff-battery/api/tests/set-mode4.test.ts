import fetch from 'node-fetch';

import { API } from '../blauhoff';
import { Logger } from '../log';
import { testDevice } from './helpers/test-device';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

const successObject = {
    msg: 'OK',
    code: 200,
    t: 1684756685989,
};

const failObject = {
    msg: 'ERROR',
    code: 401,
    t: 1684756685989,
};

describe('setMode4', () => {
    test('with valid values', async () => {
        const api = new API(new Logger());
        api.userToken = 'user-token';
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode4(testDevice, 20, 10, 600);

        const expectHeaders = {
            Accept: '*/*',
            Authorization: 'user-token',
            'Content-Type': 'application/json',
        };

        const expectedParams = JSON.stringify({
            deviceSn: testDevice.serial,
            maxFeedInLimit: 20,
            batCapMin: 10,
            timeout: 600,
        });

        expect(fetch).toHaveBeenCalledWith(
            'https://api-vpp-au.weiheng-tech.com/api/vpp/v1/hub/device/vpp/mode4',
            { body: expectedParams, headers: expectHeaders, method: 'post' },
        );

        expect(result).toStrictEqual(true);
    });

    test('with invalid maxFeedInLimit', async () => {
        const api = new API(new Logger());
        api.userToken = 'user-token';
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode4(testDevice, 150, 10, 600);

        expect(result).toStrictEqual(false);
    });

    test('with invalid batCapMin', async () => {
        const api = new API(new Logger());
        api.userToken = 'user-token';
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode4(testDevice, 25, 5, 600);

        expect(result).toStrictEqual(false);
    });

    test('with invalid timeout', async () => {
        const api = new API(new Logger());
        api.userToken = 'user-token';
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(successObject)),
        );

        const result = await api.setMode4(testDevice, 25, 10, 6000);

        expect(result).toStrictEqual(false);
    });

    test('fails', async () => {
        const api = new API(new Logger());
        api.userToken = 'user-token';
        expect(fetch).toHaveBeenCalledTimes(0);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
            new Response(JSON.stringify(failObject)),
        );

        const result = await api.setMode4(testDevice, 20, 10, 600);

        expect(result).toStrictEqual(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
