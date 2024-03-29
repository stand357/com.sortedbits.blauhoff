/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

/* eslint-disable no-console */
import { DateTime } from 'luxon';
import { convertDeviceInfoToBlauHoffDeviceStatus } from '../../api/blauhoff/helpers/device-info-to-blauhoff-device-status';
import { createQueryResponse } from '../../api/blauhoff/helpers/is-valid-response';
import { Logger } from '../../helpers/log';
import { BlauHoffDeviceStatus } from '../../api/blauhoff/models/blauhoff-device-status';

const log = new Logger();
const fs = require('fs');

fs.readFile('example.json', 'utf8', (err: Error, data: any) => {
    const json = JSON.parse(data);
    const result = createQueryResponse<BlauHoffDeviceStatus[][]>(json);

    if (!result.success) {
        console.error('Failed to queryDevice');
        return result;
    }

    result.data = convertDeviceInfoToBlauHoffDeviceStatus(log, json!);

    if (result.data) {
        const column = 'time';
        const dataResult: BlauHoffDeviceStatus[][] = [];

        result.data.forEach((row) => {
            const columnData = row.filter((r) => r.name === column);

            // Convert value to something else?
            columnData.forEach((c) => {
                const date = DateTime.fromMillis(Number(c.value));
                c.value = date.toFormat('HH:mm:ss');
            });

            dataResult.push(columnData);
        });

        console.log(dataResult);
    }

    return true;
});
