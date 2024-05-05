/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */
import fs from 'fs';

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

interface MixedResult {
    guid: string;
    solarman: any;
    modbus: any;
    capabilityId: string;
}

const mixedResults: MixedResult[] = [];

const valueSolarmanResolved = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
    const result = parseConfiguration.calculateValue(value, buffer, log);
    log.log(parseConfiguration.capabilityId, ':', result);

    const mixedResult = mixedResults.find((x) => x.guid === parseConfiguration.guid);
    if (!mixedResult) {
        const newMixedResult: MixedResult = {
            guid: parseConfiguration.guid,
            solarman: result,
            modbus: undefined,
            capabilityId: parseConfiguration.capabilityId,
        };
        mixedResults.push(newMixedResult);
    } else {
        mixedResult.solarman = result;
    }
};

const valueModbusResolved = async (value: any, buffer: Buffer, parseConfiguration: ModbusRegisterParseConfiguration) => {
    const result = parseConfiguration.calculateValue(value, buffer, log);
    log.log(parseConfiguration.capabilityId, ':', result);

    const mixedResult = mixedResults.find((x) => x.guid === parseConfiguration.guid);
    if (!mixedResult) {
        const newMixedResult: MixedResult = {
            guid: parseConfiguration.guid,
            solarman: undefined,
            modbus: result,
            capabilityId: parseConfiguration.capabilityId,
        };
        mixedResults.push(newMixedResult);
    } else {
        mixedResult.modbus = result;
    }
};

const device = DeviceRepository.getDeviceById(deviceId);

if (!device) {
    log.error('Device not found');
    process.exit(1);
}

const solarmanApi = new Solarman(log, device, host, serial, Number(port), Number(unitId));
solarmanApi.setOnDataReceived(valueSolarmanResolved);
/*
const modbusApi = new ModbusAPI(log, host, 502, unitId, device);
*/
const perform = async (): Promise<void> => {
    await solarmanApi.connect();
    await solarmanApi.readRegistersInBatch();
    /*
    modbusApi.onDataReceived = valueModbusResolved;
    await modbusApi.connect();

    await modbusApi.readRegistersInBatch();
*/
    /*
    if (device && device.supportedFlows && device.supportedFlows.actions && device.supportedFlows.actions.set_timing_ac_charge_on) {
        const args = {
            acpchgmax: 2,
            acsocmaxchg: 3,
        };
        device.supportedFlows.actions.set_timing_ac_charge_on(log, args, api);
    }
*/
};

perform()
    .then(() => {
        log.log('Registers read');
        solarmanApi.disconnect();
    })
    .catch(log.error)
    .finally(() => {
        //        modbusApi.disconnect();
        solarmanApi.disconnect();

        let output = '';

        output += '| Capability | Modbus | Solarman | \n';
        output += '| ---------- | ------ | -------- | \n';
        mixedResults.forEach((result) => {
            output += '| ' + result.capabilityId + ' | ' + result.modbus + ' | ' + result.solarman + '| \n';
        });

        fs.writeFileSync('./.build/diff.md', output);
    });
