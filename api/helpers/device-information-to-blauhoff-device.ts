import { DeviceInformation } from '../models/responses/get-device-list-response';

export const convertDeviceInformationToBlauhoffDevice = (deviceInformation: DeviceInformation) => {
    return {
        id: deviceInformation.id,
        serial: deviceInformation.deviceSn,
        model: deviceInformation.deviceModel,
    };
};
