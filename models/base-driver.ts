/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { ModbusAPI } from '../api/modbus/modbus-api';
import { Solarman } from '../api/solarman/solarman';
import { DeviceRepository } from '../repositories/device-repository/device-repository';
import { getBrand, getDeviceModelName, iconForBrand } from '../repositories/device-repository/helpers/brand-name';
import { DeviceInformation } from '../repositories/device-repository/models/device-information';
import { Brand } from '../repositories/device-repository/models/enum/brand';

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

    deviceInformationToId = (deviceInformation: ModbusDeviceInformation): string => {
        return `${this.pairingDeviceBrand}-${this.pairingDeviceModelId}-${deviceInformation.host}-${deviceInformation.port}-${deviceInformation.unitId}-${deviceInformation.solarman}`;
    };

    createPairingDevice = (deviceInformation: ModbusDeviceInformation): any => {
        if (!this.pairingDeviceModelId || !this.pairingDeviceBrand) {
            throw new Error('pairingDeviceModelId or pairingDeviceBrand is not set');
        }

        const result = {
            name: getDeviceModelName(this.pairingDeviceBrand, this.pairingDeviceModelId),
            data: {
                id: this.deviceInformationToId(deviceInformation),
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

        session.setHandler('device_type_selected', async (data: DeviceTypeFormData): Promise<FormResult> => {
            const result = getBrand(data.deviceType);
            if (!result) {
                this.error('Unknown device type', data.deviceType);
                return { success: false, message: 'Unknown device type' };
            }

            this.pairingDeviceBrand = result;

            this.log('Set pairing device type', this.pairingDeviceBrand);

            await session.nextView();
            return { success: true };
        });

        session.setHandler('device_model_selected', async (data: { model: string }): Promise<FormResult> => {
            this.pairingDeviceModelId = data.model;

            this.log('Set pairing device model', this.pairingDeviceModelId);

            const device = DeviceRepository.getInstance().getDeviceById(this.pairingDeviceModelId);

            if (!device) {
                return { success: false, message: 'Unknown device type' };
            }

            await session.nextView();
            return { success: true };
        });

        session.setHandler('list_models', async (): Promise<DeviceModelDTO[]> => {
            this.log('Listing models for', this.pairingDeviceBrand);

            const models = DeviceRepository.getInstance().getDevicesByBrand(this.pairingDeviceBrand);

            return models.map((model) => {
                return {
                    id: model.id,
                    brand: model.brand,
                    name: model.name,
                    description: model.description,
                };
            });
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

        const device = DeviceRepository.getInstance().getDeviceById(this.pairingDeviceModelId);
        if (!device) {
            this.error('Unknown device type', this.pairingDeviceBrand, this.pairingDeviceModelId);
            throw new Error('Unknown device type');
        }

        const result = await this.verifyConnection(data.host, data.port, data.unitId, device, data.solarman, data.serial);
        this.log('Pairing result', result);
        if (result) {
            //            await session.nextView();
            return { success: true };
        }
        return { success: false, message: 'Failed to connect to the device' };
    };

    verifyConnection = async (
        host: string,
        port: number,
        unitId: number,
        deviceModel: DeviceInformation,
        solarman: boolean,
        serial: string,
    ): Promise<boolean> => {
        this.log('verifyConnection', host, port, unitId, deviceModel.id, solarman, serial);

        const api = solarman ? new Solarman(this, deviceModel, host, serial /*'3518024876'*/) : new ModbusAPI(this, host, port, unitId, deviceModel);

        this.log('Connecting...');
        const result = await api.connect();

        // api.disconnect();
        if (result) {
            this.log('Disconnecting...');
        }

        return result;
    };
}
