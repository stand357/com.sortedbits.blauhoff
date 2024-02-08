import { DeviceInformation } from '../models/responses/get-device-list-response';

/**
 * Converts a DeviceInformation object to a BlauhoffDevice object.
 *
 * @param deviceInformation - The DeviceInformation object to convert.
 * @returns The converted BlauhoffDevice object.
 */
export const convertDeviceInformationToBlauhoffDevice = (deviceInformation: DeviceInformation) => {
    return {
        id: deviceInformation.id,
        serial: deviceInformation.deviceSn,
        model: deviceInformation.deviceModel,
    };
};
