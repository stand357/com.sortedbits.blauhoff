import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { BlauHoffDevice, API } from '../../api';

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
    return {
      name: `${device.model} (${device.serial})`,
      data: {
        id: device.serial,
      },
      settings: {
        accessId: this.accessId,
        accessSecret: this.accessSecret,
        userToken: this.userToken,
      },
    };
  }

  onPair = async (session: PairSession) => {
    await session.done();

    session.setHandler('list_devices', async () => {
      return this.devices.map((device) => {
        return this.createDeviceSettings(device);
      });
    });

    session.setHandler('form_complete', async (data: FormData): Promise<FormResult> => {
      this.log('form_complete', data);
      if (data.accessId && data.accessSecret) {
        try {
          const { accessId, accessSecret, serial } = data;

          const api = new API(this);

          const success = await api.updateSettings(accessId, accessSecret);

          if (!success) {
            return {
              success: false,
              message: 'Invalid credentials',
            };
          }

          this.userToken = api.userToken;

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
          message: 'No host provided',
        };
      }
    });
  }

}

module.exports = BlauhoffDriver;
