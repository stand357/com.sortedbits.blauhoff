import { convertDeviceInfoToBlauhoffDeviceStatus } from './helpers/device-info-to-blauhoff-device-status';
import { IBaseLogger } from './log';
import { IAPI } from './models/api';
import { BlauHoffDevice } from './models/blauhoff-device';
import { BlauHoffDeviceStatus } from './models/blauhoff-device-status';
import { QueryDeviceOptions } from './models/options/query-device.options';
import {
    Mode1, Mode2, Mode3, Mode4, Mode5, Mode6, Mode7,
} from './models/options/set-mode.options';
import { Rates } from './models/responses/get-rate-power-response';
import { deviceInfoResponse } from './tests/helpers/device-info';

export class MockApi implements IAPI {

    userToken: string = '';
    private accessId: string = 'XXX';
    private accessSecret: string = 'XXX';

    log: IBaseLogger;

    constructor(log: IBaseLogger) {
        this.log = log;
    }

    getAuthenticationInfo = (): { accessId: string, accessSecret: string } => {
        return {
            accessId: this.accessId,
            accessSecret: this.accessSecret,
        };
    }

    setAuthenticationInfo = (accessId: string, accessSecret: string) => {
        this.accessId = accessId;
        this.accessSecret = accessSecret;

        this.userToken = '';
    }

    updateSettings = async (accessId: string, accessSecret: string): Promise<boolean> => {
        this.setAuthenticationInfo(accessId, accessSecret);
        return this.getUserToken();
    }

    queryDeviceList = async (pageSize: number = 10): Promise<BlauHoffDevice[]> => {
        return [
            {
                serial: 'SHA602131202215005',
                model: 'SPHA6.0H-10.24kW',
                id: '1678686019714682881',
            },
            {
                serial: 'SHA602131202215004',
                model: 'SPHA6.0H-10.24kW',
                id: '1678686019714682880',
            },
        ];
    }

    queryDevice = async (device: BlauHoffDevice, options: QueryDeviceOptions): Promise<BlauHoffDeviceStatus[][]> => {
        const response = deviceInfoResponse;
        return convertDeviceInfoToBlauhoffDeviceStatus(this.log, response);
    }

    bindDevice = async (serial: string): Promise<boolean> => {
        return true;
    }

    getRatePower = async (device: BlauHoffDevice): Promise<Rates | undefined> => {
        return {
            pvRatePower: 6118,
            gridRatePower: 4600,
            batteryRatePower: 517225,
            batteryCapacity: 10,
        };
    }

    setMode1 = async (device: BlauHoffDevice, options: Mode1): Promise<boolean> => {
        return true;
    }

    setMode2 = async (device: BlauHoffDevice, options: Mode2): Promise<boolean> => {
        return true;
    }

    setMode3 = async (device: BlauHoffDevice, options: Mode3): Promise<boolean> => {
        return true;
    }

    setMode4 = async (device: BlauHoffDevice, options: Mode4): Promise<boolean> => {
        return true;
    }

    setMode5 = async (device: BlauHoffDevice, options: Mode5): Promise<boolean> => {
        return true;
    }

    setMode6 = async (device: BlauHoffDevice, options: Mode6): Promise<boolean> => {
        return true;
    }

    setMode7 = async (device: BlauHoffDevice, options: Mode7): Promise<boolean> => {
        return true;
    }

    getUserToken = async (): Promise<boolean> => {
        this.userToken = 'XXX';
        return true;
    }

}
