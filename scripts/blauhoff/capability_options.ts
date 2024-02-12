import { deviceInfoMapping } from '../../drivers/blauhoff-battery/helpers/device-info-mapping';

const maps = deviceInfoMapping;

const output: { [key: string]: any } = {};
Object.keys(maps).forEach((key) => {
    const { id, title } = maps[key];

    output[id] = { title };
});

// eslint-disable-next-line no-console
console.log(JSON.stringify(output, null, 2));
