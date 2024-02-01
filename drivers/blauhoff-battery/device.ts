import Homey from 'homey';
import { MockApi } from '../../api/mock-api';
import { IAPI } from '../../api/models/api';
import { BlauHoffDevice } from '../../api';
import { BlauHoffDeviceStatus } from '../../api/models/blauhoff-device-status';
import { deviceInfoMapping } from './helpers/device-info-mapping';
import { Mode1, Mode2 } from '../../api/models/options/set-mode.options';

class BlauhoffBattery extends Homey.Device {

  api: IAPI = new MockApi(this);
  device: BlauHoffDevice | undefined;

  fetchUserToken = async (accessId: string, accessSecret: string): Promise<boolean> => {
    const result = await this.api.updateSettings(accessId, accessSecret);

    if (!result) {
      this.error('Failed to get user token, please check your credentials');
    } else {
      const token = this.api.getUserToken();
      await this.setSettings({
        userToken: token,
      });
    }

    return result;
  }

  deviceFromData = async (): Promise<BlauHoffDevice | undefined> => {
    const { id, serial, model } = this.getData();
    if (!id || !serial || !model) {
      return undefined;
    }

    return {
      id,
      serial,
      model,
    };
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('BlauhoffBattery has been initialized');

    const { accessId, accessSecret, userToken } = this.getSettings();

    if (!userToken) {
      await this.fetchUserToken(accessId, accessSecret);
    } else {
      this.api.setUserToken(userToken);

      const success = await this.api.validateUserToken();

      if (!success) {
        await this.fetchUserToken(accessId, accessSecret);
      }
    }

    this.device = await this.deviceFromData();

    this.registerModeListener(this.api.setMode1, 'set_mode_1');
    this.registerModeListener(this.api.setMode2, 'set_mode_2');
    this.registerModeListener(this.api.setMode3, 'set_mode_3');
    this.registerModeListener(this.api.setMode4, 'set_mode_4');
    this.registerModeListener(this.api.setMode5, 'set_mode_5');
    this.registerModeListener(this.api.setMode6, 'set_mode_6');
    this.registerModeListener(this.api.setMode7, 'set_mode_7');

    await this.getDeviceStatus();
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('BlauhoffBattery has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: {
      [key: string]: boolean | string | number | undefined | null
    };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('BlauhoffBattery settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('BlauhoffBattery was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('BlauhoffBattery has been deleted');
  }

  setCapabilities = async (info: BlauHoffDeviceStatus[]) => {
    for (const capability of info) {
      const mapping = deviceInfoMapping[capability.name];

      if (mapping) {
        const { value } = capability;
        const { id, valueMultiplier } = mapping;

        if (valueMultiplier) {
          await this.setCapabilityValue(id, Number(value) * valueMultiplier);
        } else {
          await this.setCapabilityValue(id, value);
        }
      }
    }
  }

  getDeviceStatus = async () => {
    if (!this.device) {
      return;
    }

    const status = await this.api.queryDevice(this.device, {
      start: 0,
      end: 1,
    });

    const row = this.device.serial === 'SHA602131202215005' ? 0 : 1;

    this.log('parsing row', row);

    await this.setCapabilities(status[row]);
  }

  private registerModeListener = (method: (device: BlauHoffDevice, args: any) => Promise<boolean>, id: string) => {
    const card = this.homey.flow.getActionCard(id);

    card.registerRunListener(async (args) => {
      if (!this.device) {
        return false;
      }

      delete args.device;

      this.log(`Triggering '${id}' with ${JSON.stringify(args)}`);

      const result = await method(this.device, args);
      return result;
    });
  };

}

module.exports = BlauhoffBattery;
