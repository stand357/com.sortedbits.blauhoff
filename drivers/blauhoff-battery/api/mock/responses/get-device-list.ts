import { IMockResponse } from '../mock-fetch-response';

export class GetDeviceListResponse implements IMockResponse {

    successObject = {
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
