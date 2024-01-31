import { IMockResponse } from '../mock-fetch-response';

export class BindDeviceResponse implements IMockResponse {

    successObject = {
        msg: 'OK',
        code: 200,
        t: 1684756685989,
        data: {
            bindedList: [],
            invalidList: [],
            notExistList: [],
        },
    };

    failObject = {
        msg: 'ERROR',
        code: 401,
        t: 1684756685989,
    }

    success(): Promise<any> {
        return Promise.resolve(this.successObject);
    }

    fail(): Promise<any> {
        return Promise.resolve(this.failObject);
    }

}
