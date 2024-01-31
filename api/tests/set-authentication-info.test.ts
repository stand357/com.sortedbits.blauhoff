import { API } from '../api';
import { Logger } from '../log';

describe('set-authentication-info', () => {
    test('update', async () => {
        const api = new API(new Logger());
        api.userToken = 'test';

        api.setAuthenticationInfo('access-id', 'access-secret');

        const info = api.getAuthenticationInfo();

        expect(info.accessId).toStrictEqual('access-id');
        expect(info.accessSecret).toStrictEqual('access-secret');
        expect(api.userToken).toStrictEqual('');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
