/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

'use strict';

import Homey from 'homey';
import { ArgumentAutocompleteResults } from 'homey/lib/FlowCard';
import { DeviceRepository } from './repositories/device-repository/device-repository';
import { AccessMode } from './repositories/device-repository/models/enum/access-mode';
import { getSupportedFlowTypes } from './repositories/device-repository/models/supported-flows';

class BlauHoffApp extends Homey.App {
    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        this.log('BlauHoffApp has been initialized');

        const registerAutocompleteCard = this.homey.flow.getActionCard('write_value_to_register');
        this.registerWriteRegisterAutocomplete(registerAutocompleteCard);

        const values = getSupportedFlowTypes();

        values.forEach((flowType) => {
            this.log('Registering action card', flowType);
            this.homey.flow.getActionCard(flowType).registerRunListener(async (args) => {
                await args.device.callAction(flowType, args);
            });
        });
    }

    registerWriteRegisterAutocomplete = (card: Homey.FlowCardAction) => {
        card.registerArgumentAutocompleteListener('register', async (query, args): Promise<ArgumentAutocompleteResults> => {
            const device = args.device as Homey.Device;
            const { deviceType, modelId } = device.getData();

            const deviceModel = DeviceRepository.getInstance().getDeviceById(modelId);
            if (!deviceModel) {
                this.error('Unknown device type', deviceType);
                throw new Error('Unknown device type');
            }

            if (!args['registerType']) {
                this.error('No register type specified');
                return [];
            } else {
                const registers = args['registerType'] === 'holding' ? deviceModel.holdingRegisters : deviceModel.inputRegisters;
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
