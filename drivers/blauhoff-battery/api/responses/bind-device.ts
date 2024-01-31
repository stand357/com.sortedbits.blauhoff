import { BaseResponse } from './base-response';

interface Data {
    bindedList: string[];
    invalidList: string[];
    notExistList: string[];
}

export interface BindDevice extends BaseResponse {
    data: Data;
}
