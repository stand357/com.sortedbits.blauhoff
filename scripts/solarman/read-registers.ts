/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { Solarman } from '../../api/solarman/solarman';
import { Logger } from '../../helpers/log';
import { DeviceRepository } from '../../repositories/device-repository/device-repository';
import { ModbusRegisterParseConfiguration } from '../../repositories/device-repository/models/modbus-register';

require('dotenv').config();

const log = new Logger();

if (!process.env.HOST || !process.env.PORT || !process.env.SERIAL || !process.env.PORT || !process.env.DEVICE_ID || !process.env.UNIT_ID) {
    log.error('Missing environment variables');
    process.exit(1);
}

const host = process.env.HOST;
const port = process.env.PORT;
const serial = process.env.SERIAL;
const deviceId = process.env.DEVICE_ID;
const unitId = process.env.UNIT_ID;

const valueSolarmanResolved = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
    const result = parseConfiguration.calculateValue(value, buffer, log);

    if (!parseConfiguration.validateValue(result)) {
        log.error(parseConfiguration.capabilityId, ': INVALID', result);
    } else {
        log.log(parseConfiguration.capabilityId, ':', result);
    }
};

const device = DeviceRepository.getInstance().getDeviceById(deviceId);

if (!device) {
    log.error('Device not found');
    process.exit(1);
}

const solarmanApi = new Solarman(log, device, host, serial, Number(port), Number(unitId));
solarmanApi.setOnDataReceived(valueSolarmanResolved);

const perform = async (): Promise<void> => {
    await solarmanApi.connect();
    //    await solarmanApi.readAllAtOnce();
    await solarmanApi.readRegistersInBatch();

    /*
    const register = device.getRegisterByTypeAndAddress(RegisterType.Holding, 154);

    if (!register) {
        log.error('Register not found');
        process.exit(1);
    }

    const powerLimit = 3390;
    const result = await solarmanApi.readAddress(register);
    log.log('Initial result:', result);

    await solarmanApi.writeRegister(register, powerLimit);
    for (let i = 0; i < 100; i++) {
        //        await new Promise((resolve) => setTimeout(resolve, 10));

        const result = await solarmanApi.readAddress(register);
        log.log('Result for ', i, ':', result);
    }
    */
};

perform()
    .then(() => {
        log.log('Registers read');
    })
    .catch(log.error)
    .finally(() => {
        solarmanApi.disconnect();
    });
