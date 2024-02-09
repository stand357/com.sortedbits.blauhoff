import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { ModbusAPI } from '../../api/modbus/modbus-api';
import { getDefinition } from './helpers/get-definition';
import { getDeviceType } from './helpers/device-type';
import { DeviceType } from './models/device-type';
import { nameForDeviceType } from './helpers/name-for-device-type';

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

class ModbusDriver extends Homey.Driver {

  pairingDeviceType: DeviceType = DeviceType.Blauhoff;
  modbusDeviceInformation: ModbusDeviceInformation | undefined;

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ModbusDriver has been initialized');
  }

  createPairingDevice = (deviceInformation: ModbusDeviceInformation): any => {
    const result = {
      name: nameForDeviceType(this.pairingDeviceType),
      data: {
        id: `${this.pairingDeviceType}-${deviceInformation.host}-${deviceInformation.port}-${deviceInformation.unitId}`,
        deviceType: this.pairingDeviceType,
      },
      settings: {
        host: deviceInformation.host,
        port: deviceInformation.port,
        unitId: deviceInformation.unitId,
        refreshInterval: 10,
      },
      icon: this.iconForDeviceType(this.pairingDeviceType),
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
      const result = getDeviceType(data.deviceType);
      if (!result) {
        this.error('Unknown device type', data.deviceType);
        return { success: false, message: 'Unknown device type' };
      }

      this.pairingDeviceType = result;

      this.log('Set pairing device type', this.pairingDeviceType);

      await session.nextView();
      return { success: true };
    });

    session.setHandler('modbus_device_information', async (data: ModbusDeviceInformation): Promise<FormResult> => {
      this.log('modbus_device_information', data);
      return this.pairModbusDevice(session, data);
    });
  }

  pairModbusDevice = async (session: PairSession, data: ModbusDeviceInformation): Promise<FormResult> => {
    this.modbusDeviceInformation = data;

    const definition = getDefinition(this, this.pairingDeviceType);

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
