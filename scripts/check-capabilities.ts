import fs from 'fs';
import { DeviceRepository } from '../repositories/device-repository/device-repository';

const defaultsJson = '.homeycompose/drivers/templates/defaults.json';

const json = fs.readFileSync(defaultsJson, { encoding: 'utf-8' });
const obj = JSON.parse(json);

const capabilitiesOptions = obj['capabilitiesOptions'];

const ignoreList = ['readable_boolean.device_status', 'date.record'];

const findCapability = (capability: string): boolean => {
    let result = false;

    const devices = DeviceRepository.getInstance().devices;

    for (const device of devices) {
        const found = device.inputRegisters.some((r) => r.hasCapability(capability));
        if (found) {
            result = true;
        }

        const found2 = device.holdingRegisters.some((r) => r.hasCapability(capability));
        if (found2) {
            result = true;
        }

        if (result) {
            break;
        }
    }

    return result;
};

const capabilities = Object.keys(capabilitiesOptions);

for (const capability of capabilities) {
    if (!ignoreList.includes(capability)) {
        const found = findCapability(capability);

        if (!found) {
            console.log(`Capability ${capability} is not used`);
        }
    }
}
