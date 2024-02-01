import { deviceInfoMapping } from '../drivers/blauhoff-battery/helpers/device-info-mapping';

const maps = deviceInfoMapping;

Object.keys(maps).forEach((key) => {
    console.log(key, maps[key].id);
});