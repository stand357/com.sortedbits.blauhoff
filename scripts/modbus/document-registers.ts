import path from 'path';
import fs from 'fs';
import { devices } from '../../drivers/blauhoff-modbus/devices/devices';
import { orderModbusRegisters } from '../../drivers/blauhoff-modbus/helpers/order-modbus-registers';
import { brands } from '../../drivers/blauhoff-modbus/models/brand';
import { unitForCapability } from '../../drivers/blauhoff-modbus/helpers/units';
import { findFile } from '../../helpers/fs-helpers';

let output = '';

const capabilitiesOptions: { [key: string]: any } = {};

const driverComposeFiles = findFile('../../drivers', 'driver.compose.json');
driverComposeFiles.push(path.resolve('../../.homeycompose/drivers/templates/defaults.json'));

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

brands.forEach((brand) => {
    const models = devices.filter((device) => device.brand === brand);

    output += `# ${brand.toLocaleUpperCase()}\n`;
    models.forEach((model) => {
        output += `## ${model.name}\n`;
        output += `${model.description}\n\n`;

        const registers = model.getDefinition();

        output += '### Input Registers\n';
        output += '| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |\n';
        output += '| ------- | ------ | --------- | ---- | ----- | ------------- | --------------- |\n';
        orderModbusRegisters(registers.inputRegisters).forEach((register) => {
            const unit = unitForCapability(register.capabilityId);
            output += `| ${register.address} | ${register.length} | ${register.dataType.toString()} | ${unit} | ${register.scale} | ${register.capabilityId} | ${capabilitiesOptions[register.capabilityId]} |\n`;
        });

        output += '\n### Holding Registers\n';
        output += '| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |\n';
        output += '| ------- | ------ | --------- | ---- |----- | ------------- | --------------- |\n';
        orderModbusRegisters(registers.holdingRegisters).forEach((register) => {
            const unit = unitForCapability(register.capabilityId);
            output += `| ${register.address} | ${register.length} | ${register.dataType.toString()} | ${unit} | ${register.scale} | ${register.capabilityId} | ${capabilitiesOptions[register.capabilityId]} |\n`;
        });

        output += '\n';
    });
});

fs.writeFileSync('../../.build/modbus-registers.md', output);

const readme = fs.readFileSync('../../docs/README-template.md', 'utf8');

fs.writeFileSync('../../README.md', readme.replace('{{MODBUS_REGISTERS}}', output));
