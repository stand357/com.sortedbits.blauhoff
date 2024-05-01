/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import fs from 'fs';
import path from 'path';
import { unitForCapability } from '../../helpers/units';
import { DeviceRepository } from '../../repositories/device-repository/device-repository';
import { orderModbusRegisters } from '../../repositories/device-repository/helpers/order-modbus-registers';
import { brands } from '../../repositories/device-repository/models/enum/brand';
import { findFile } from './helpers/fs-helpers';

let output = '';

const capabilitiesOptions: { [key: string]: any } = {};

const driverComposeFiles = findFile('./drivers', 'driver.compose.json');
driverComposeFiles.push(path.resolve('./.homeycompose/drivers/templates/defaults.json'));

for (const file of driverComposeFiles) {
    const json = fs.readFileSync(file, { encoding: 'utf-8' });
    const obj = JSON.parse(json);

    if (obj['capabilitiesOptions']) {
        const allKeys = Object.keys(obj['capabilitiesOptions']);

        for (const key of allKeys) {
            if (obj['capabilitiesOptions'][key]['title']['en']) {
                if (Object.keys(capabilitiesOptions).indexOf(key) === -1) {
                    capabilitiesOptions[key] = obj['capabilitiesOptions'][key]['title']['en'];
                }
            }
        }
    }
}

capabilitiesOptions['measure_power'] = 'Power';
capabilitiesOptions['meter_power'] = 'Energy';

brands.forEach((brand) => {
    const models = DeviceRepository.getDevicesByBrand(brand);

    output += `# ${brand.toLocaleUpperCase()}\n`;
    models.forEach((model) => {
        output += `## ${model.name}\n`;
        output += `${model.description}\n\n`;

        const registers = model.definition;

        if (registers.inputRegisters.length > 0) {
            output += '### Input Registers\n';
            output += '| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |\n';
            output += '| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |\n';
            orderModbusRegisters(registers.inputRegisters).forEach((register) => {
                const unit = unitForCapability(register.capabilityId);
                output += `| ${register.address}`;
                output += `| ${register.length}`;
                output += `| ${register.dataType.toString()}`;
                output += `| ${unit}`;
                output += `| ${register.scale ?? '-'}`;
                output += `| ${register.transformation ? 'Yes' : 'No'}`;
                output += `| ${register.capabilityId}`;
                output += `| ${capabilitiesOptions[register.capabilityId]} |\n`;
            });
        }

        if (registers.holdingRegisters.length > 0) {
            output += '\n### Holding Registers\n';
            output += '| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |\n';
            output += '| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- |\n';
            orderModbusRegisters(registers.holdingRegisters).forEach((register) => {
                const unit = unitForCapability(register.capabilityId);
                output += `| ${register.address}`;
                output += `| ${register.length}`;
                output += `| ${register.dataType.toString()}`;
                output += `| ${unit}`;
                output += `| ${register.scale ?? '-'}`;
                output += `| ${register.transformation ? 'Yes' : 'No'}`;
                output += `| ${register.capabilityId}`;
                output += `| ${capabilitiesOptions[register.capabilityId]} |\n`;
            });
        }
        output += '\n';
    });
});

fs.writeFileSync('./.build/modbus-registers.md', output);

const readme = fs.readFileSync('./docs/README-template.md', 'utf8');

fs.writeFileSync('./README.md', readme.replace('{{MODBUS_REGISTERS}}', output));
