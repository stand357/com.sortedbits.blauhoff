export interface BaseResponse {
    code: number;
    msg: string;
    t: number;
}

export const isValidResponse = (response: BaseResponse | undefined): boolean => {
    if (response === undefined) {
        return false;
    }

    return (response.code === 200 && response.msg === 'OK');
};
