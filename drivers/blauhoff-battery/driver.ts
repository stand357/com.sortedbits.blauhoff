import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { BlauHoffDevice } from '../../api';
import { MockApi } from '../../api/mock-api';

interface FormResult {
  success: boolean;
  devices?: BlauHoffDevice[];
  message?: unknown;
}

interface FormData {
  accessId: string;
  accessSecret: string;
  serial?: string;
}

class BlauhoffDriver extends Homey.Driver {

  accessId: string = '';
  accessSecret: string = '';
  serial: string = '';
  userToken: string = '';

  devices: BlauHoffDevice[] = [];
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('BlauhoffDriver has been initialized');
  }

  createDeviceSettings = (device: BlauHoffDevice): any => {
    const result = {
      name: `${device.model} (${device.serial})`,
      data: {
        id: device.id,
        serial: device.serial,
        model: device.model,
      },
      settings: {
        accessId: this.accessId,
        accessSecret: this.accessSecret,
        userToken: this.userToken,
        refreshInterval: 60,
      },
    };

    this.log('createDeviceSettings', result);

    return result;
  }

  onPair = async (session: PairSession) => {
    await session.done();

    session.setHandler('list_devices', async () => {
      return this.devices.map((device) => {
        return this.createDeviceSettings(device);
      });
    });

    session.setHandler('form_complete', async (data: FormData): Promise<FormResult> => {
      return this.pairFormComplete(data, session);
    });
  }

  onRepair = async (session: PairSession, device: Homey.Device) => {
    session.setHandler('register_serial_complete', async (data: FormData): Promise<FormResult> => {
      return this.registerSerialFormComplete(data, session);
    });
  }

  pairFormComplete = async (data: FormData, session: PairSession): Promise<FormResult> => {
    this.log('form_complete', data);
    if (data.accessId && data.accessSecret) {
      try {
        const { accessId, accessSecret, serial } = data;

        const api = new MockApi(this);

        const success = await api.updateSettings(accessId, accessSecret);

        if (!success) {
          return {
            success: false,
            message: 'Invalid credentials',
          };
        }

        this.userToken = api.userToken;
        this.accessId = accessId;
        this.accessSecret = accessSecret;

        if (serial) {
          const bindResult = await api.bindDevice(serial);
          if (!bindResult) {
            return {
              success: false,
              message: 'Could not bind device',
            };
          }
        }

        this.devices = await api.queryDeviceList();

        await session.nextView();

        return {
          success: true,
          devices: this.devices,
        };
      } catch (error) {
        return {
          success: false,
          message: error,
        };
      }
    } else {
      return {
        success: false,
        message: 'No Access ID or Access Secret provided',
      };
    }
  }

  registerSerialFormComplete = async (data: FormData, session: PairSession): Promise<FormResult> => {
    this.log('register_serial_complete', data);
    const { serial } = data;
    if (serial) {
      try {
        const api = new MockApi(this);

        const bindResult = await api.bindDevice(serial);
        if (!bindResult) {
          return {
            success: false,
            message: 'Could not bind device',
          };
        }

        this.devices = await api.queryDeviceList();

        return {
          success: true,
          devices: this.devices,
        };
      } catch (error) {
        return {
          success: false,
          message: error,
        };
      }
    } else {
      return {
        success: false,
        message: 'No serial provided',
      };
    }
  }

}

module.exports = BlauhoffDriver;
