import Homey from 'homey';
import { ModbusAPI } from '../../api/modbus/modbus-api';
import { getDefinition } from './helpers/get-definition';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { ModbusDeviceDefinition } from '../../api/modbus/models/modbus-device-registers';
import { DeviceType } from './models/device-type';
import { getDeviceType } from './helpers/device-type';

class ModbusDevice extends Homey.Device {

  private api?: ModbusAPI;
  private deviceType?: DeviceType;
  private stop: boolean = false;
  private reachable: boolean = true;

  /**
   * Handles the value received from a Modbus register.
   *
   * @param value - The value received from the Modbus register.
   * @param register - The Modbus register object.
   * @returns A Promise that resolves when the value is handled.
   */
  private dataReceived = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value);
    this.log(register.capabilityId, result);
    await this.setCapabilityValue(register.capabilityId, result);

    if (!this.reachable) {
      this.reachable = true;
    }
  }

  private onError = async (error: unknown, register: ModbusRegister) => {
    if (error && (error as any)['name'] && (error as any)['name'] === 'TransactionTimedOutError') {
      this.reachable = false;
    } else {
      this.error('Request failed', error);
    }
  }

  /**
   * Initializes the capabilities of the Modbus device based on the provided definition.
   * @param definition The Modbus device definition.
   */
  private initializeCapabilities = async (definition: ModbusDeviceDefinition) => {
    for (const register of definition.inputRegisters) {
      if (!this.hasCapability(register.capabilityId)) {
        await this.addCapability(register.capabilityId);
      }
    }
    for (const register of definition.holdingRegisters) {
      if (!this.hasCapability(register.capabilityId)) {
        await this.addCapability(register.capabilityId);
      }
    }
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('ModbusDevice has been initialized');

    const { host, port, unitId } = this.getSettings();
    const { deviceType } = this.getData();

    this.log('ModbusDevice', host, port, unitId, deviceType);

    this.deviceType = getDeviceType(deviceType);

    if (this.deviceType) {
      const registers = getDefinition(this, this.deviceType);
      await this.initializeCapabilities(registers);

      this.api = new ModbusAPI(this, host, port, unitId, registers);
      this.api.dataReceived = this.dataReceived;
      this.api.onError = this.onError;

      const isOpen = await this.api.connect();

      if (isOpen) {
        await this.readRegisters();
      }
    } else {
      this.error('Unknown device type', deviceType);
    }
  }

  /**
   * Reads the registers from the device.
   *
   * @returns {Promise<void>} A promise that resolves when the registers are read.
   */
  private readRegisters = async () => {
    this.log('Reading registers for ', this.getName());
    await this.api?.readRegisters();

    if (!this.stop) {
      const { refreshInterval } = this.getSettings();

      const interval = this.reachable ? refreshInterval * 1000 : 60000;

      await this.homey.setTimeout(this.readRegisters.bind(this), interval);
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ModbusDevice has been added');
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
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('ModbusDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('ModbusDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('ModbusDevice has been deleted');
    this.stop = true;
  }

}

module.exports = ModbusDevice;
