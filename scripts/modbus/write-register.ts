/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusAPI } from '../../api/modbus/modbus-api';
import { Logger } from '../../helpers/log';
import { DeviceRepository } from '../../repositories/device-repository/device-repository';
import { Brand } from '../../repositories/device-repository/models/enum/brand';
import { RegisterDataType } from '../../repositories/device-repository/models/enum/register-datatype';
import { ModbusRegister } from '../../repositories/device-repository/models/modbus-register';

//const host = '10.210.5.12';
const host = '88.159.155.195';
const port = 502;
const unitId = 1;
const log = new Logger();

const registerAddress = 145;

const valueResolved = async (value: any, buffer: Buffer, register: ModbusRegister) => {
    const result = register.calculateValue(value, buffer, log);
    log.log(register.capabilityId, result);
};

// const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Growatt, 'growatt-tl3');
const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, 'deye-sun-xk-sg01hp3-eu-am2');

const addressInfo = ModbusRegister.default('', registerAddress, 1, RegisterDataType.INT16);

const api = new ModbusAPI(log, host, port, unitId, device!);

const perform = async (): Promise<void> => {
    api.onDataReceived = valueResolved;

    await api.connect();

    const address = device?.definition.holdingRegisters.find((r) => r.address === 142);

    if (!address) {
        log.error('Address not found');
        process.exit(1);
        return;
    }

    log.filteredLog('Reading current value', addressInfo.address);
    //    const currentValue = await api.readAddress(address);

    await api.writeRegister(addressInfo, 0);
    //    log.filteredLog('Current value', currentValue);

    await api.writeRegister(addressInfo, 0);
};

perform()
    .then(() => {
        log.log('Performed test');
    })
    .catch(log.error)
    .finally(() => {
        api.disconnect();
    });
