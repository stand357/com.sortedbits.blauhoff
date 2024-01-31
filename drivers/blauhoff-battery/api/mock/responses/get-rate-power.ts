import { IMockResponse } from '../mock-fetch-response';

export class GetRatePowerResponse implements IMockResponse {

    successObject = {
        msg: 'OK',
        code: 200,
        t: 1684756685989,
        data: {
            pvRatePower: 6118, // W
            gridRatePower: 4600, // W
            batteryRatePower: 51725, // W
            batteryCapacity: 10, // kWh
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
