import { BaseResponse } from './base-response';

export interface GetUserToken extends BaseResponse {
    data: string;
    success: boolean;
}
