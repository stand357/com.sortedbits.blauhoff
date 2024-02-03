import Homey from 'homey';
import { MockApi } from '../../api/mock-api';
import { IAPI } from '../../api/models/iapi';
import { API, BlauHoffDevice } from '../../api';
import { BlauHoffDeviceStatus } from '../../api/models/blauhoff-device-status';
import { deviceInfoMapping } from './helpers/device-info-mapping';

class BlauhoffBattery extends Homey.Device {

  // api: IAPI = new MockApi(this);
  api: IAPI = new API(this);

  device: BlauHoffDevice | undefined;
  stop: boolean = false;

  /**
   * Fetches the user token using the provided access ID and access secret.
   * @param accessId The access ID.
   * @param accessSecret The access secret.
   * @returns A promise that resolves to a boolean indicating whether the user token was successfully fetched.
   */
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

  syncUserToken = async () => {
    const { userToken } = this.getSettings();
    if (this.api.getUserToken() !== userToken) {
      await this.setSettings({
        userToken: this.api.getUserToken(),
      });
    }
  }

  /**
   * Retrieves the device information from the data and returns a BlauHoffDevice object.
   * @returns A promise that resolves to a BlauHoffDevice object if the required data is available, otherwise undefined.
   */
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

    const {
      accessId, accessSecret, userToken, baseUrl,
    } = this.getSettings();

    if (baseUrl) {
      this.api.updateBaseUrl(baseUrl);
    }

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
  // eslint-disable-next-line consistent-return
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
    this.log('BlauhoffBattery settings where changed', newSettings.accessId, newSettings.accessSecret);

    if (changedKeys.includes('accessId') || changedKeys.includes('accessSecret')) {
      const result = await this.api.updateSettings(newSettings.accessId as string ?? '', newSettings.accessSecret as string ?? '');
      if (!result) {
        return 'Invalid credentials';
      }
    }
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
    this.stop = true;
    this.log('BlauhoffBattery has been deleted');
  }

  /**
   * Sets the capabilities of the BlauHoff device based on the provided information.
   * @param info An array of BlauHoffDeviceStatus objects representing the capabilities and their values.
   */
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

  /**
   * Retrieves the status of the device.
   * @returns {Promise<void>} A promise that resolves when the device status is retrieved and processed.
   */
  getDeviceStatus = async () => {
    if (!this.device) {
      return;
    }

    await this.syncUserToken();

    const end = Date.now() / 1000;
    const start = end - 1000;

    const status = await this.api.queryDevice(this.device, {
      start,
      end,
    });

    if (status.length > 0) {
      await this.setCapabilities(status[0]);
    }

    if (!this.stop) {
      const { refreshInterval } = this.getSettings();
      await this.homey.setTimeout(this.getDeviceStatus.bind(this), refreshInterval * 1000);
    }
  }

  /**
   * Registers a mode listener for the specified method and ID.
   * @param method The method to be executed when the action card is run.
   * @param id The ID of the action card.
   */
  private registerModeListener = (method: (device: BlauHoffDevice, args: any) => Promise<boolean>, id: string) => {
    const card = this.homey.flow.getActionCard(id);

    card.registerRunListener(async (args) => {
      if (!this.device) {
        return false;
      }

      await this.syncUserToken();

      delete args.device;

      this.log(`Triggering '${id}' with ${JSON.stringify(args)}`);

      const result = await method(this.device, args);
      return result;
    });
  };

}

module.exports = BlauhoffBattery;
