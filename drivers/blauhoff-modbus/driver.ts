import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { ModbusAPI } from '../../api/modbus/modbus-api';
import { getDefinition, getModelsForBrand } from './helpers/get-definition';
import { getBrand, iconForBrand, getDeviceModelName } from './helpers/brand-name';
import { Brand } from './models/brand';
import { devices } from './devices/devices';

interface DeviceTypeFormData {
  deviceType: string;
}

interface ModbusDeviceInformation {
  host: string;
  port: number;
  unitId: number;
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

class ModbusDriver extends Homey.Driver {

  pairingDeviceBrand: Brand = Brand.Blauhoff;
  pairingDeviceModelId: string | undefined;
  modbusDeviceInformation: ModbusDeviceInformation | undefined;

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
      },
      icon: iconForBrand(this.pairingDeviceBrand),
    };

    this.log('createPairingDevice', result);
    return result;
  };

  onPair = async (session: PairSession) => {
    session.setHandler('list_devices', async () => {
      if (this.modbusDeviceInformation) {
        return [
          this.createPairingDevice(this.modbusDeviceInformation!),
        ];
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

      const definition = getDefinition(this.pairingDeviceBrand, this.pairingDeviceModelId);
      if (!definition) {
        return { success: false, message: 'Unknown device type' };
      }

      await session.nextView();
      return { success: true };
    });

    session.setHandler('list_models', async (): Promise<DeviceModelDTO[]> => {
      this.log('Listing models for', this.pairingDeviceBrand);

      return getModelsForBrand(this.pairingDeviceBrand).map((model) => {
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
  }

  pairModbusDevice = async (session: PairSession, data: ModbusDeviceInformation): Promise<FormResult> => {
    this.modbusDeviceInformation = data;

    if (!this.pairingDeviceModelId) {
      throw new Error('pairingDeviceModelId is not set');
    }

    const definition = getDefinition(this.pairingDeviceBrand, this.pairingDeviceModelId);
    if (!definition) {
      this.error('Unknown device type', definition);
      throw new Error('Unknown device type');
    }

    const result = await ModbusAPI.verifyConnection(this, data.host, data.port, data.unitId, definition);

    if (result) {
      await session.nextView();
      return { success: true };
    }
    return { success: false, message: 'Failed to connect to the device' };
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

}

module.exports = ModbusDriver;
