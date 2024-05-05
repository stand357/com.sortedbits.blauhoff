/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

/* eslint-disable no-console */
import { deviceInfoMapping } from '../../.old-driver/blauhoff-battery/helpers/device-info-mapping';

const maps = deviceInfoMapping;

Object.keys(maps).forEach((key) => {
    console.log(`"${maps[key].id}",`);
});
