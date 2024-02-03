import { BlauHoffDevice } from './blauhoff-device';
import { BlauHoffDeviceStatus } from './blauhoff-device-status';
import { QueryDeviceOptions } from './options/query-device.options';
import {
    Mode1, Mode2, Mode3, Mode4, Mode5, Mode6, Mode7,
} from './options/set-mode.options';
import { Rates } from './responses/get-rate-power-response';

export interface IAPI {
    updateBaseUrl(baseUrl: string): void;
    getAuthenticationInfo(): { accessId: string, accessSecret: string };
    setAuthenticationInfo(accessId: string, accessSecret: string): void;
    updateSettings(accessId: string, accessSecret: string): Promise<boolean>;
    queryDeviceList(pageSize: number): Promise<BlauHoffDevice[]>;
    queryDevice(device: BlauHoffDevice, options: QueryDeviceOptions): Promise<BlauHoffDeviceStatus[][]>
    bindDevice(serial: string): Promise<boolean>;
    getRatePower(device: BlauHoffDevice): Promise<Rates | undefined>;
    setMode1(device: BlauHoffDevice, options: Mode1): Promise<boolean>;
    setMode2(device: BlauHoffDevice, options: Mode2): Promise<boolean>;
    setMode3(device: BlauHoffDevice, options: Mode3): Promise<boolean>;
    setMode4(device: BlauHoffDevice, options: Mode4): Promise<boolean>;
    setMode5(device: BlauHoffDevice, options: Mode5): Promise<boolean>;
    setMode6(device: BlauHoffDevice, options: Mode6): Promise<boolean>;
    setMode7(device: BlauHoffDevice, options: Mode7): Promise<boolean>;

    setUserToken(userToken: string): void;
    getUserToken(): string;
    fetchUserToken(): Promise<boolean>;
    validateUserToken(): Promise<boolean>;
}
