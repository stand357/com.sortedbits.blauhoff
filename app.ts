/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

'use strict';

import Homey from 'homey';
import { ArgumentAutocompleteResults } from 'homey/lib/FlowCard';
import { getBrand } from './api/modbus/helpers/brand-name';
import { DeviceRepository } from './api/modbus/device-repository/device-repository';
import { AccessMode } from './api/modbus/models/enum/access-mode';

class BlauHoffApp extends Homey.App {
    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        this.log('BlauHoffApp has been initialized');

        const registerAutocompleteCard = this.homey.flow.getActionCard('write_value_to_register');
        this.registerWriteRegisterAutocomplete(registerAutocompleteCard);
    }

    registerWriteRegisterAutocomplete = (card: Homey.FlowCardAction) => {
        card.registerArgumentAutocompleteListener('register', async (query, args): Promise<ArgumentAutocompleteResults> => {
            const device = args.device as Homey.Device;
            const { deviceType, modelId } = device.getData();

            const brand = getBrand(deviceType);
            if (!brand) {
                this.error('Unknown device type', deviceType);
                throw new Error('Unknown device type');
            }

            const deviceModel = DeviceRepository.getDeviceByBrandAndModel(brand, modelId);
            if (!deviceModel || !deviceModel?.definition) {
                this.error('Unknown device type', deviceType);
                throw new Error('Unknown device type');
            }

            if (!args['registerType']) {
                this.error('No register type specified');
                return [];
            } else {
                const registers = args['registerType'] === 'holding' ? deviceModel.definition.holdingRegisters : deviceModel.definition.inputRegisters;
                const filtered = registers.filter((r) => r.accessMode !== AccessMode.ReadOnly).filter((r) => r.address.toString().includes(query));

                return filtered.map((r) => {
                    return {
                        name: r.address.toString(),
                        address: r.address,
                    };
                });
            }
        });
    };
}

module.exports = BlauHoffApp;
