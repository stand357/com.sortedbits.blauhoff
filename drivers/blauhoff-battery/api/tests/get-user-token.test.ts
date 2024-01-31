import { test } from 'jest';
import { SimpleClass } from 'homey';

import { API } from '../blauhoff';

test('succesfully get a user token', () => {

    const log = new SimpleClass();
    const api = new API(log);

    const userToken = api.getUserToken();

    console.log(userToken);

});