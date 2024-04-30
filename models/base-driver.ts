/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { DeviceRepository } from '../api/device-repository/device-repository';
import { getDeviceModelName, iconForBrand } from '../api/modbus/helpers/brand-name';
import { ModbusAPI } from '../api/modbus/modbus-api';
import { DeviceModel } from '../api/modbus/models/device-model';
import { Brand } from '../api/modbus/models/enum/brand';
import { Solarman } from '../api/solarman/solarman';

interface DeviceTypeFormData {
    deviceType: string;
}

interface ModbusDeviceInformation {
    host: string;
    port: number;
    unitId: number;
    solarman: boolean;
    serial: string;
}

interface FormResult {
    success: boolean;
    message?: unknown;
}

interface DeviceModelDTO {
    id: string;
    brand: Brand;
    name: string;
    description: string;
}

export class BaseDriver extends Homey.Driver {
    pairingDeviceBrand: Brand = Brand.Deye;
    pairingDeviceModelId: string | undefined;
    modbusDeviceInformation: ModbusDeviceInformation | undefined;

    public filteredLog(...args: any[]) {
        this.log(args);
    }

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit() {
        this.log('ModbusDriver has been initialized');
    }

    createPairingDevice = (deviceInformation: ModbusDeviceInformation): any => {
        if (!this.pairingDeviceModelId || !this.pairingDeviceBrand) {
            throw new Error('pairingDeviceModelId or pairingDeviceBrand is not set');
        }

        const result = {
            name: getDeviceModelName(this.pairingDeviceBrand, this.pairingDeviceModelId),
            data: {
                id: `${this.pairingDeviceBrand}-${this.pairingDeviceModelId}-${deviceInformation.host}-${deviceInformation.port}-${deviceInformation.unitId}`,
                deviceType: this.pairingDeviceBrand,
                modelId: this.pairingDeviceModelId,
            },
            settings: {
                host: deviceInformation.host,
                port: deviceInformation.port,
                unitId: deviceInformation.unitId,
                refreshInterval: 10,
                solarman: deviceInformation.solarman,
                serial: deviceInformation.serial,
            },
            icon: iconForBrand(this.pairingDeviceBrand),
        };

        this.log('createPairingDevice', result);
        return result;
    };

    onPair = async (session: PairSession) => {
        session.setHandler('list_devices', async () => {
            if (this.modbusDeviceInformation) {
                return [this.createPairingDevice(this.modbusDeviceInformation!)];
            }
            return [];
        });

        session.setHandler('modbus_device_information', async (data: ModbusDeviceInformation): Promise<FormResult> => {
            this.log('modbus_device_information', data);
            return this.pairModbusDevice(session, data);
        });
    };

    pairModbusDevice = async (session: PairSession, data: ModbusDeviceInformation): Promise<FormResult> => {
        this.modbusDeviceInformation = data;

        if (!this.pairingDeviceModelId) {
            throw new Error('pairingDeviceModelId is not set');
        }

        const device = DeviceRepository.getDeviceByBrandAndModel(this.pairingDeviceBrand, this.pairingDeviceModelId);
        if (!device?.definition) {
            this.error('Unknown device type', this.pairingDeviceBrand, this.pairingDeviceModelId);
            throw new Error('Unknown device type');
        }

        const result = await this.verifyConnection(data.host, data.port, data.unitId, device, data.solarman, data.serial);

        if (result) {
            await session.nextView();
            return { success: true };
        }
        return { success: false, message: 'Failed to connect to the device' };
    };

    verifyConnection = async (host: string, port: number, unitId: number, deviceModel: DeviceModel, solarman: boolean, serial: string): Promise<boolean> => {
        this.log('verifyConnection', host, port, unitId, deviceModel.id, solarman, serial);

        const api = solarman ? new Solarman(this, deviceModel, host, serial) : new ModbusAPI(this, host, port, unitId, deviceModel);

        this.log('Connecting...');
        const result = await api.connect();

        // api.disconnect();
        if (result) {
            this.log('Disconnecting...');
        }

        return result;
    };
}
