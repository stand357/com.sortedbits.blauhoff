import { BaseResponse } from './base-response';

export interface Rates {
    pvRatePower: number;
    gridRatePower: number;
    batteryRatePower: number;
    batteryCapacity: number;
}

export interface GetRatePower extends BaseResponse {
    data: Rates;
}
