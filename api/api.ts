import fetch from 'node-fetch';
import { BlauHoffDeviceData } from './models/blauhoff-device-data';
import { BlauHoffDevice } from './models/blauhoff-device';
import { BlauHoffDeviceStatus } from './models/blauhoff-device-status';
import { IBaseLogger } from './log';
import { BaseResponse } from './models/responses/base-response';
import { GetUserTokenResponse } from './models/responses/get-user-token-response';
import { GetDeviceListResponse } from './models/responses/get-device-list-response';
import { GetRatePowerResponse, Rates } from './models/responses/get-rate-power-response';
import { BindDeviceResponse } from './models/responses/bind-device-response';
import { convertDeviceInformationToBlauhoffDevice } from './helpers/device-information-to-blauhoff-device';
import { isValidResponse } from './helpers/is-valid-response';

export class API {

    private baseUrl: string = 'https://api-vpp-au.weiheng-tech.com/api/vpp';
    private accessId: string = 'XXX';
    private accessSecret: string = 'XXX';

    userToken: string = '';
    log: IBaseLogger;

    constructor(log: IBaseLogger) {
        this.log = log;
    }

    setAuthenticationInfo = (accessId: string, accessSecret: string) => {
        this.accessId = accessId;
        this.accessSecret = accessSecret;

        this.userToken = '';
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
        this.setAuthenticationInfo(accessId, accessSecret);
        return this.getUserToken();
    }

    /**
     * Retrieves the list of BlauHoff devices.
     *
     * @returns A promise that resolves to an array of BlauHoffDevice objects.
     */
    queryDeviceList = async (pageSize: number = 10): Promise<BlauHoffDevice[]> => {
        const devices: BlauHoffDevice[] = [];

        const page1 = await this.queryDeviceListPage(1, pageSize);

        if (!isValidResponse(page1)) {
            this.log.error('Failed to get device list');
            return [];
        }

        page1!.data.data.forEach((item) => {
            devices.push(convertDeviceInformationToBlauhoffDevice(item));
        });

        for (let pageNr = 2; pageNr <= page1!.data.totalPages; pageNr++) {
            const page = await this.queryDeviceListPage(pageNr, 2);
            if (isValidResponse(page)) {
                page!.data.data.forEach((item) => {
                    devices.push(convertDeviceInformationToBlauhoffDevice(item));
                });
            }
        }

        return devices;
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

        const data = await this.performRequest<BindDeviceResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            return false;
        }

        if (data!.data.bindedList.indexOf(serial) === -1) {
            return false;
        }

        return true;
    }

    /**
     * Queries the rate power of a BlauHoff device.
     *
     * @param device - The BlauHoff device to query.
     * @returns A promise that resolves to the rate power of the device.
     */
    getRatePower = async (device: BlauHoffDevice): Promise<Rates | undefined> => {
        const path = `/v1/hub/device/info?deviceSn=${device.serial}`;

        const data = await this.performRequest<GetRatePowerResponse>(path, 'get');

        if (!isValidResponse(data)) {
            this.log.error('Failed to get rate power');
            return undefined;
        }

        this.log.log(`Got device info: ${data}`);
        return data!.data;
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
        if (maxFeedInLimit < 0 || maxFeedInLimit > 100) {
            this.log.error('maxFeedInLimit must be between 0 and 100');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode1';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode1');
            return false;
        }

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
        if (batteryPower < -6000 || batteryPower > 0) {
            this.log.error('batteryPower must be between -6000 and 0');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode2';

        const params = {
            deviceSn: device.serial,
            batPower: batteryPower,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode2');
            return false;
        }

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
        if (batteryPower < 0 || batteryPower > 6000) {
            this.log.error('batteryPower must be between 0 and 6000');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode3';

        const params = {
            deviceSn: device.serial,
            batPower: batteryPower,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode3');
            return false;
        }

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
        if (maxFeedInLimit < 0 || maxFeedInLimit > 100) {
            this.log.error('maxFeedInLimit must be between 0 and 100');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode4';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode4');
            return false;
        }

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
        if (maxFeedInLimit < 0 || maxFeedInLimit > 100) {
            this.log.error('maxFeedInLimit must be between 0 and 100');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode5';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode4');
            return false;
        }

        this.log.log(`Set mode5: ${data}`);
        return true;
    }

    /**
     * Sets the mode6 of the BlauHoff device.
     * Inverter outputs at specified power
     *
     * @param device - The BlauHoff device to set the mode6 for.
     * @param batPower - Battery power. Positive -> Discharge, Negative -> Charge (0~6000) W
     * @param batPowerInvLimit - Battery power ref, limit (0~6000) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode6 = async (device: BlauHoffDevice, batPower: number, batPowerInvLimit: number, batCapMin: number, timeout: number): Promise<boolean> => {
        if (batPower < 0 || batPower > 6000) {
            this.log.error('batPower must be between 0 and 6000');
            return false;
        }

        if (batPowerInvLimit < 0 || batPowerInvLimit > 6000) {
            this.log.error('batPowerInvLimit must be between 0 and 6000');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode6';

        const params = {
            deviceSn: device.serial,
            batPower,
            batPowerInvLimit,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode6');
            return false;
        }

        this.log.log(`Set mode6: ${data}`);
        return true;
    }

    /**
     * Sets the mode7 of the BlauHoff device.
     * Inverter operates at the specified power
     *
     * @param device - The BlauHoff device to set the mode7 for.
     * @param batPower - Battery power. Positive -> Discharge, Negative -> Charge (0~6000) W
     * @param batCapMin - Battery Min Capacity (10 - 100)
     * @param timeout - The configuration will reset after a specified number of seconds(0~5000)s
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode7 = async (device: BlauHoffDevice, batPower: number, batCapMin: number, timeout: number): Promise<boolean> => {
        if (batPower < 0 || batPower > 6000) {
            this.log.error('batPower must be between 0 and 6000');
            return false;
        }

        if (batCapMin < 10 || batCapMin > 100) {
            this.log.error('batCapMin must be between 10 and 100');
            return false;
        }

        if (timeout < 0 || timeout > 5000) {
            this.log.error('timeout must be between 0 and 5000');
            return false;
        }

        const path = '/v1/hub/device/vpp/mode7';

        const params = {
            deviceSn: device.serial,
            batPower,
            batCapMin,
            timeout,
        };

        const data = await this.performRequest<BaseResponse>(path, 'post', params);

        if (!isValidResponse(data)) {
            this.log.error('Failed to setMode7');
            return false;
        }

        this.log.log(`Set mode7: ${data}`);
        return true;
    }

    /**
     * Retrieves the user token from the server.
     * @returns {Promise<void>} A promise that resolves when the user token is retrieved successfully.
     */
    getUserToken = async (): Promise<boolean> => {
        const path = '/v1/user/token';

        const header = {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Access-Id': this.accessId,
            'Access-Secret': this.accessSecret,
        };

        const data = await this.performRequest<GetUserTokenResponse>(path, 'post', {}, header);

        if (!isValidResponse(data)) {
            this.userToken = '';
            return false;
        }

        this.userToken = data!.data;
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
    private queryDeviceListPage = async (page: number, pageSize: number): Promise<GetDeviceListResponse | undefined> => {
        const path = '/v1/hub/device/info/list';

        const params = {
            pageSize,
            pageNum: page,
        };

        const data = await this.performRequest<GetDeviceListResponse>(path, 'post', params);

        return data;
    }

    /**
     * Returns the authorization header for API requests.
     * @returns {Headers} The authorization header.
     */
    private authorizationHeader = () => {
        return {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: this.userToken,
        };
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
     * @param {Headers} [headers] - The headers to include in the request.
     * @returns {Promise<Type>} - A promise that resolves to the response data.
     */
    performRequest = async <Type>(
        path: string,
        method: 'get' | 'post',
        params: any = {},
        headers?: any,
    ): Promise<Type | undefined> => {
        this.log.log(`Performing request to ${path} with params: ${JSON.stringify(params)}`);
        const header = headers ?? this.authorizationHeader();

        try {
            const response = await fetch(this.baseUrl + path, {
                method,
                headers: header,
                body: JSON.stringify(params),
            });

            if (response === undefined || response.status !== 200) {
                this.log.error(`Response failed: ${response?.statusText}`);
                return undefined;
            }

            const data = await response.json() as BaseResponse;

            this.log.log(`Response from ${path}:`, JSON.stringify(data));

            if (data.code === undefined || data.code !== 200 || data.msg === undefined || data.msg !== 'OK') {
                return undefined;
            }

            return data as any;
        } catch (error) {
            this.log.error(`Error performing request to ${path}: ${error}`);
            return undefined;
        }
    }

}
