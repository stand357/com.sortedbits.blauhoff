import { IMockResponse } from '../mock-fetch-response';

export class GetUserTokenResponse implements IMockResponse {

    successObject = {
        msg: 'OK',
        code: 200,
        t: 1684756685989,
        data: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2ODQ3NjMzMjQsImFjY2Vzc0lkIjoiWDEhVVkqYzFDYk45TmpIJDBiTnIifQ.HIjAkwZ8WWSjY6UVfAH7nmhQQvUK95IXQnVFPIxwOwU',
        success: true,
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
