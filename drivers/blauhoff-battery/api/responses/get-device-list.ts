import { BaseResponse } from './base-response';

interface DeviceInformation {
    deviceSn: string;
    deviceModel: string;
    state: number;
    id: string
}

interface PagingInformation {
    totalPages: number;
    totalCount: number;
    data: DeviceInformation[];
}

export interface GetDeviceList extends BaseResponse {
    data: PagingInformation
}
