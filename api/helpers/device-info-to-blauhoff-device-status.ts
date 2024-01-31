import { IBaseLogger } from '../log';
import { BlauHoffDeviceStatus } from '../models/blauhoff-device-status';
import { DeviceInfoResponse } from '../models/responses/device-info-response';

export const convertDeviceInfoToBlauhoffDeviceStatus = (log: IBaseLogger, deviceInfo: DeviceInfoResponse): BlauHoffDeviceStatus[][] => {
    // These fields should contain the same amount of items
    if (deviceInfo.data.columns.length !== deviceInfo.data.metadata.length) {
        log.error('deviceInfo.data.columns.length !== deviceInfo.data.metadata.length', deviceInfo.data.columns.length, deviceInfo.data.metadata.length);

        return [];
    }

    const rowData = deviceInfo.data.rows.map((row, index): BlauHoffDeviceStatus[] => {
        const data: BlauHoffDeviceStatus[] = [];

        deviceInfo.data.columns.forEach((column, columnIndex) => {
            const metadata = deviceInfo.data.metadata[columnIndex];
            const value = row[columnIndex];

            data.push({
                name: column,
                dataType: metadata,
                value,
            });
        });

        return data;
    });

    return rowData;
};
