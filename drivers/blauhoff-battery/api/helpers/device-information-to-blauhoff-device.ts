import { DeviceInformation } from '../responses/get-device-list';

export const convertDeviceInformationToBlauhoffDevice = (deviceInformation: DeviceInformation) => {
    return {
        id: deviceInformation.id,
        serial: deviceInformation.deviceSn,
        model: deviceInformation.deviceModel,
    };
};
