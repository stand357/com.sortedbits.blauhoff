import { SimpleClass } from 'homey';
import fetch, { Headers } from 'node-fetch';
import { BlauHoffDeviceData } from './blauhoff-device-data';
import { BlauHoffDevice } from './blauhoff-device';
import { BlauHoffDeviceStatus } from './blauhoff-device-status';

export class API {

    private baseUrl: string = 'https://api-vpp-au.weiheng-tech.com/api/vpp';
    private accessId: string = 'XXX';
    private accessSecret: string = 'XXX';

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
        let currentPage = 1;
        let devices: BlauHoffDevice[] = [];

        let result = await this.queryDeviceListPage(currentPage);
        while (result.length > 0) {
            devices = devices.concat(result);
            currentPage++;
            result = await this.queryDeviceListPage(currentPage);
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

        const response = await fetch(this.baseUrl + path, {
            method: 'post',
            headers: this.authorizationHeader(),
            body: JSON.stringify(params),
        });

        if (response.status !== 200) {
            this.log.error(`Failed to bind device: ${response.statusText}`);
            return false;
        }

        const json = await response.json();
        this.log.log(`Bound device ${serial}`, json);
        return true;
    }

    /**
     * Queries the rate power of a BlauHoff device.
     *
     * @param device - The BlauHoff device to query.
     * @returns A promise that resolves to the rate power of the device.
     */
    queryRatePower = async (device: BlauHoffDevice): Promise<number> => {
        const path = `/v1/hub/device/info?deviceSn=${device.serial}`;

        const response = await fetch(this.baseUrl + path, {
            method: 'get',
            headers: this.authorizationHeader(),
        });

        if (response.status !== 200) {
            this.log.error(`Failed to get device info: ${response.statusText}`);
            return 0;
        }

        const data = await response.json();
        this.log.log(`Got device info: ${data}`);
        return 0;
    }

    /**
     * Sets the mode1 of the BlauHoff device.
     *
     * @param device - The BlauHoff device to set the mode1 for.
     * @param maxFeedInLimit - The maximum feed-in limit.
     * @param batteryCapMinimum - The minimum battery capacity.
     * @returns A promise that resolves to a boolean indicating whether the mode1 was set successfully.
     */
    setMode1 = async (device: BlauHoffDevice, maxFeedInLimit: number, batteryCapMinimum: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode1';

        const params = {
            deviceSn: device.serial,
            maxFeedInLimit,
            batCapMin: batteryCapMinimum,
        };

        const response = await fetch(this.baseUrl + path, {
            method: 'post',
            headers: this.authorizationHeader(),
            body: JSON.stringify(params),
        });

        if (response.status !== 200) {
            this.log.error(`Failed to set mode1: ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        this.log.log(`Set mode1: ${data}`);
        return true;
    }

    /**
     * Sets the mode2 of the BlauHoff device.
     *
     * @param device - The BlauHoff device to set the mode2 for.
     * @param batteryPower - The battery power value.
     * @param timeout - The timeout value.
     * @returns A promise that resolves to a boolean indicating whether the mode2 was set successfully.
     */
    setMode2 = async (device: BlauHoffDevice, batteryPower: number, timeout: number): Promise<boolean> => {
        const path = '/v1/hub/device/vpp/mode2';

        const params = {
            deviceSn: device.serial,
            batPower: batteryPower,
            timeout,
        };

        const response = await fetch(this.baseUrl + path, {
            method: 'post',
            headers: this.authorizationHeader(),
            body: JSON.stringify(params),
        });

        if (response.status !== 200) {
            this.log.error(`Failed to set mode2: ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        this.log.log(`Set mode2: ${data}`);
        return true;
    }

    /**
     * Queries the BlauHoff devices using the provided access credentials.
     *
     * @param log - The logger instance.
     * @param accessId - The access ID for authentication.
     * @param accessSecret - The access secret for authentication.
     * @returns A promise that resolves to an array of BlauHoffDevice objects representing the queried devices.
     */
    public static queryDevices = async (log: SimpleClass, accessId: string, accessSecret: string): Promise<BlauHoffDevice[]> => {
        const api = new API(log);

        const success = await api.updateSettings(accessId, accessSecret);
        if (!success) {
            log.error('Failed to update settings');
            return [];
        }

        const devices = await api.queryDeviceList();
        return devices;
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

        const response = await fetch(this.baseUrl + path, {
            method: 'post',
            headers: this.authorizationHeader(),
            body: JSON.stringify(params),
        });

        if (response.status !== 200) {
            this.log.error(`Failed to get device list: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        this.log.log(`Got device list: ${data}`);

        if (data.totalCount === 0) {
            return [];
        }

        // TODO: Parse results
        return [];
    }

    /**
     * Retrieves the user token from the server.
     * @returns {Promise<void>} A promise that resolves when the user token is retrieved successfully.
     */
    private getUserToken = async (): Promise<boolean> => {
        const path = '/v1/user/token';

        const header = new Headers({
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Access-Id': this.accessId,
            'Access-Secret': this.accessSecret,
        });

        const response = await fetch(this.baseUrl + path, {
            method: 'GET',
            headers: header,
        });

        if (response.status !== 200) {
            this.log.error('Failed to get user token:', response.statusText);
            return false;
        }

        const data = await response.json();
        this.log.log(`Got user token: ${data}`);
        this.userToken = data;
        return true;
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

}
