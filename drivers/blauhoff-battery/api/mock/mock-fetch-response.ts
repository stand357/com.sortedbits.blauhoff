export interface BaseResponse {
    code: number;
    msg: string;
}

export interface IMockResponse {
    successObject: BaseResponse;
    failObject: BaseResponse;

    success(): Promise<BaseResponse>;
    fail(): Promise<BaseResponse>;
}

/**
 * Represents a mock fetch response.
 * @template Type - The type of the debug output.
 */
export class MockFetchResponse<Type extends IMockResponse> {

    mockOutputType: Type;
    success: boolean;

    /**
     * Gets the status code of the response.
     */
    get status(): number {
        return this.success ? this.mockOutputType.successObject.code : this.mockOutputType.failObject.code;
    }

    /**
     * Gets the status text of the response.
     */
    get statusText(): string {
        return this.success ? this.mockOutputType.successObject.msg : this.mockOutputType.failObject.msg;
    }

    /**
     * Creates a new instance of MockFetchResponse.
     * @param debugOutput - The debug output.
     * @param success - Indicates whether the response is successful or not.
     */
    constructor(debugOutput: Type, success: boolean) {
        this.mockOutputType = debugOutput;
        this.success = success;
    }

    /**
     * Returns a promise that resolves to the JSON representation of the response.
     * @returns A promise that resolves to the JSON representation of the response.
     */
    async json(): Promise<any> {
        if (this.success) {
            return this.mockOutputType.success();
        }
        return this.mockOutputType.fail();
    }

    toString(): string {
        if (this.success) {
            return JSON.stringify(this.mockOutputType.successObject);
        }
        return JSON.stringify(this.mockOutputType.failObject);
    }

}
