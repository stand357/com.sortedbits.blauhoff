export class GenericOutputResponse {

    successObject = {
        msg: 'OK',
        code: 200,
        t: 1684756685989,
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
