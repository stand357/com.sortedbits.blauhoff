import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { API, BlauHoffDevice } from '../../api/blauhoff';

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
        baseUrl: 'https://api-vpp-au.weiheng-tech.com/api/vpp',
        refreshInterval: 60,
      },
    };

    this.log('createDeviceSettings', result);

    return result;
  }

  onPair = async (session: PairSession) => {
    session.setHandler('list_devices', async () => {
      return this.devices.map((device) => {
        return this.createDeviceSettings(device);
      });
    });

    session.setHandler('form_complete', async (data: FormData): Promise<FormResult> => {
      return this.pairFormComplete(data, session);
    });
  }

  pairFormComplete = async (data: FormData, session: PairSession): Promise<FormResult> => {
    this.log('form_complete', data);
    if (data.accessId && data.accessSecret) {
      try {
        const { accessId, accessSecret, serial } = data;

        // const api = new MockApi(this);
        const api = new API(this);

        const result = await api.updateSettings(accessId, accessSecret);

        if (!result.success) {
          return {
            success: false,
            message: 'Invalid credentials',
          };
        }

        this.userToken = api.getUserToken();
        this.accessId = accessId;
        this.accessSecret = accessSecret;

        if (serial) {
          const bindResult = await api.bindDevice(serial);
          if (!bindResult.success) {
            return {
              success: false,
              message: 'Could not bind device',
            };
          }
        }

        const deviceResult = await api.queryDeviceList();

        if (deviceResult.success) {
          this.devices = deviceResult.data ?? [];
          await session.nextView();

          return {
            success: true,
            devices: this.devices,
          };
        }
        return {
          success: false,
          message: 'Failed to get devices from API, please check the form or try again later',
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

}

module.exports = BlauhoffDriver;
