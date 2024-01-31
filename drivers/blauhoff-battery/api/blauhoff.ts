import { SimpleClass } from 'homey';
import fetch, { Headers } from 'node-fetch';
import { BlauHoffDeviceData } from './blauhoff-device-data';
import { BlauHoffDevice } from './blauhoff-device';
import { BlauHoffDeviceStatus } from './blauhoff-device-status';
import { IMockResponse, MockFetchResponse } from './mock/mock-fetch-response';
import { GetUserTokenResponse } from './mock/responses/get-user-token';
import { BindDeviceResponse } from './mock/responses/bind-device';
import { GetDeviceListResponse } from './mock/responses/get-device-list';
import { GetRatePowerResponse } from './mock/responses/get-rate-power';
import { GenericOutputResponse } from './mock/responses/generic-output';

export class API {

    private baseUrl: string = 'https://api-vpp-au.weiheng-tech.com/api/vpp';
    private accessId: string = 'XXX';
    private accessSecret: string = 'XXX';

    mockResponses: boolean = true;
    userToken: string = '';
    log: SimpleClass;

    constructor(log: SimpleClass) {
        this.log = log;
    }

    /**
     * Updates the settings for the Blauhoff API.
     *
     * @param baseUrl - The base URL of the Blauhoff API.
     * @param accessId - The access ID for authentication.
     * @param accessSecret - The access secret for authentication.
     * @param refreshInterval - The refresh interval in milliseconds.
     * @returns A Promise that resolves when the settings are updated.
     */
    updateSettings = async (accessId: string, accessSecret: string): Promise<boolean> => {
        this.accessId = accessId;
        this.accessSecret = accessSecret;

        this.userToken = '';

        return this.getUserToken();
    }

    /**
     * Retrieves the list of BlauHoff devices.
     *
     * @returns A promise that resolves to an array of BlauHoffDevice objects.
     */
    queryDeviceList = async (): Promise<BlauHoffDevice[]> => {
        // let currentPage = 1;
        // let devices: BlauHoffDevice[] = [];

        const result = await this.queryDeviceListPage(1);
        /*
        while (result.length > 0) {
            devices = devices.concat(result);
            currentPage++;
            result = await this.queryDeviceListPage(currentPage);
        }
        */

        return result;
    }

    /**
     * Retrieves the status of a BlauHoff device.
     *
     * @param device - The BlauHoff device for which to retrieve the status.
     * @returns A promise that resolves to an array of BlauHoffDeviceStatus objects representing the device status.
     */
    queryDevice = async (device: BlauHoffDevice): Promise<BlauHoffDeviceStatus[]> => {
        const path = '/v1/hub/device/info/query';

        // Do we want to store the previous query time?
        // In the example only the last 1000 seconds are used.
        /*
        const previousTime = device.lastStatusUpdate.getTime() / 1000;
        device.lastStatusUpdate = new Date();
        const currentTime = device.lastStatusUpdate.getTime() / 1000;
        */

        const currentTime = Date.now() / 1000;
        const previousTime = currentTime - 1000;

        const params = {
            deviceSn: device.serial,
            end: currentTime,
            start: previousTime,
        };

        const response = await fetch(this.baseUrl + path, {
            method: 'post',
            headers: this.authorizationHeader(),
            body: JSON.stringify(params),
        });

        // Parse response

        const data = await response.json();
        return this.getRowFromData(data, 0);
    }

    /**
     * Binds a device to the hub.
     *
     * @param serial - The serial number of the device to bind.
     * @returns A promise that resolves when the device is successfully bound.
     */
    bindDevice = async (serial: string): Promise<boolean> => {
        const path = '/v1/hub/device/bind';

        const params = {
            deviceSnList: [
                serial,
            ],
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, false, new MockFetchResponse(new BindDeviceResponse(), debugSuccess));
        return data;
    }

    /**
     * Queries the rate power of a BlauHoff device.
     *
     * @param device - The BlauHoff device to query.
     * @returns A promise that resolves to the rate power of the device.
     */
    queryRatePower = async (device: BlauHoffDevice): Promise<number> => {
        const path = `/v1/hub/device/info?deviceSn=${device.serial}`;

        const debugSuccess = true;

        const data = await this.performRequest(path, 'get', {}, {}, new MockFetchResponse(new GetRatePowerResponse(), debugSuccess));

        this.log.log(`Got device info: ${data}`);
        return 0;
    }

    /**
     * Sets the mode1 of the BlauHoff device.
     * Self-consumption
     *
     * @param device - The BlauHoff device to set the mode1 for.
     * @param maxFeedInLimit - Maximum Percentage of Rated Power Feed to Grid (0 - 100) %
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @returns A promise that resolves to a boolean indicating whether the mode1 was set successfully.
     */
    setMode1 = async (device: BlauHoffDevice, maxFeedInLimit: number, batCapMin: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode1';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode1: ${data}`);
        return true;
    }

    /**
     * Sets the mode2 of the BlauHoff device.
     * Direct charge at specified power level
     *
     * @param device - The BlauHoff device to set the mode2 for.
     * @param batteryPower - Battery power. Positive -> Discharge, Negative -> Charge(-6000~0) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode2 = async (device: BlauHoffDevice, batteryPower: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode2';

        const params = {
            deviceSn: device.serial,
            batPower: batteryPower,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode2: ${data}`);
        return true;
    }

    /**
     * Sets the mode3 of the BlauHoff device.
     * Direct discharge at specified power level
     *
     * @param device - The BlauHoff device to set the mode3 for.
     * @param batteryPower - Battery power. Positive -> Discharge, Negative -> Charge (0~6000) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode3 = async (device: BlauHoffDevice, batteryPower: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode3';

        const params = {
            deviceSn: device.serial,
            batPower: batteryPower,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode3: ${data}`);
        return true;
    }

    /**
     * Sets the mode4 of the BlauHoff device.
     * Discharge only to the load, avoid charging.
     *
     * @param device - The BlauHoff device to set the mode4 for.
     * @param maxFeedInLimit - Maximum Percentage of Rated Power Feed to Grid (0 - 100) %
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode4 = async (device: BlauHoffDevice, maxFeedInLimit: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode4';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode4: ${data}`);
        return true;
    }

    /**
     * Sets the mode5 of the BlauHoff device.
     * Change only，no discharging
     *
     * @param device - The BlauHoff device to set the mode5 for.
     * @param maxFeedInLimit - Maximum Percentage of Rated Power Feed to Grid (0 - 100) %
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode5 = async (device: BlauHoffDevice, maxFeedInLimit: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode5';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode5: ${data}`);
        return true;
    }

    /**
     * Sets the mode6 of the BlauHoff device.
     * Change only，no discharging
     *
     * @param device - The BlauHoff device to set the mode6 for.
     * @param batPower - Battery power. Positive -> Discharge, Negative -> Charge (0~6000) W
     * @param batPowerInvLimit - Battery power ref, limit (0~6000) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode6 = async (device: BlauHoffDevice, batPower: number, batPowerInvLimit: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode6';

        const params = {
            deviceSn: device.serial,
            batPower,
            batPowerInvLimit,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode6: ${data}`);
        return true;
    }

    /**
     * Sets the mode7 of the BlauHoff device.
     * Change only，no discharging
     *
     * @param device - The BlauHoff device to set the mode7 for.
     * @param batPower - Battery power. Positive -> Discharge, Negative -> Charge (0~6000) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode7 = async (device: BlauHoffDevice, batPower: number, batCapMin: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode6';

        const params = {
            deviceSn: device.serial,
            batPower,
            batCapMin,
            timeout,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {}, new MockFetchResponse(new GenericOutputResponse(), debugSuccess));
        this.log.log(`Set mode6: ${data}`);
        return true;
    }

    /**
     * Retrieves the user token from the server.
     * @returns {Promise<void>} A promise that resolves when the user token is retrieved successfully.
     */
    getUserToken = async (): Promise<boolean> => {
        const path = '/v1/user/token';

        const header = new Headers({
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Access-Id': this.accessId,
            'Access-Secret': this.accessSecret,
        });

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', {}, {} as any, new MockFetchResponse(new GetUserTokenResponse(), debugSuccess), header);

        this.userToken = data;
        return true;
    }

    /**
     * Retrieves a row of BlauHoffDeviceStatus objects from the given BlauHoffDeviceData based on the specified rowIndex.
     * If the rowIndex is out of bounds, an empty array is returned.
     *
     * @param data - The BlauHoffDeviceData object containing the columns, metadata, and rows.
     * @param rowIndex - The index of the row to retrieve.
     * @returns An array of BlauHoffDeviceStatus objects representing the row data.
     */
    private getRowFromData = (data: BlauHoffDeviceData, rowIndex: number): BlauHoffDeviceStatus[] => {
        const { columns, metadata, rows } = data;

        if (rows.length <= rowIndex) {
            this.log.error(`Row index ${rowIndex} is out of bounds`);
            return [];
        }

        const results: BlauHoffDeviceStatus[] = [];

        for (let index = 0; index < columns.length; index++) {
            const result: BlauHoffDeviceStatus = {
                name: columns[index],
                dataType: metadata[index],
                value: rows[rowIndex][index],
            };

            results.push(result);
        }

        return results;
    }

    /**
     * Retrieves a page of BlauHoff devices.
     *
     * @param page - The page number to retrieve.
     * @returns A promise that resolves to an array of BlauHoffDevice objects representing the devices on the page.
     */
    private queryDeviceListPage = async (page: number): Promise<BlauHoffDevice[]> => {
        const path = '/v1/hub/device/info/list';

        const params = {
            pageSize: 10,
            pageNum: page,
        };

        const debugSuccess = true;
        const data = await this.performRequest(path, 'post', params, {} as any, new MockFetchResponse(new GetDeviceListResponse(), debugSuccess));

        this.log.log(`Got device list: ${JSON.stringify(data)}`);

        if (data.data.totalCount === 0) {
            this.log.log('No devices found');
            return [];
        }

        const items = data.data.data as any[];

        const result: BlauHoffDevice[] = items.map((item) => {
            return {
                id: item.id,
                serial: item.deviceSn,
                model: item.deviceModel,
                lastStatusUpdate: new Date(),
            };
        });

        this.log.log(`Got ${result.length} devices`);

        return result;
    }

    /**
     * Returns the authorization header for API requests.
     * @returns {Headers} The authorization header.
     */
    private authorizationHeader = () => {
        return new Headers({
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: this.userToken,
        });
    }

    /**
     * Performs a request to the specified path using the specified method.
     * This can also mock a response, for testing purposes.
     *
     * @template Type - The type of the response data.
     * @param {string} path - The path to send the request to.
     * @param {'get' | 'post'} method - The HTTP method to use for the request.
     * @param {any} params - The parameters to include in the request.
     * @param {Type} errorValue - The value to return in case of an error.
     * @param {MockFetchResponse<IMockResponse>} mockResponse - The mock response to use for testing purposes.
     * @param {Headers} [headers] - The headers to include in the request.
     * @returns {Promise<Type>} - A promise that resolves to the response data.
     */
    private performRequest = async <Type>(
        path: string,
        method: 'get' | 'post',
        params: any, errorValue: Type,
        mockResponse: MockFetchResponse<IMockResponse>,
        headers?: Headers,
    ): Promise<Type> => {
        this.log.log(`Performing request to ${path} with params: ${JSON.stringify(params)}`);

        const response = !this.mockResponses ? await fetch(this.baseUrl + path, {
            method,
            headers: headers ?? this.authorizationHeader(),
            body: JSON.stringify(params),
        }) : mockResponse;

        this.log.log(`Response from ${path}: ${response}`);

        if (response.status !== 200) {
            this.log.error(`Failed to get device list: ${response.statusText}`);
            return errorValue;
        }

        const data = await response.json();

        return data;
    }

}
