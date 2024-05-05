/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */
import fs from 'fs';

import { ModbusAPI } from '../../api/modbus/modbus-api';
import { Solarman } from '../../api/solarman/solarman';
import { Logger } from '../../helpers/log';
import { DeviceRepository } from '../../repositories/device-repository/device-repository';
import { Brand } from '../../repositories/device-repository/models/enum/brand';
import { ModbusRegisterParseConfiguration } from '../../repositories/device-repository/models/modbus-register';

//const host = '10.210.5.17';
//const serial = '3518024876';

const host = '88.159.155.195';
const serial = '2782776185';

const log = new Logger();
const unitId = 1;

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

const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, 'deye-sun-xk-sg01hp3-eu-am2');
//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Afore, 'afore-hybrid-inverter');
//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Growatt, 'growatt-tl3');

if (!device) {
    log.error('Device not found');
    process.exit(1);
}

const solarmanApi = new Solarman(log, device, host, serial, 8899, unitId);
solarmanApi.setOnDataReceived(valueSolarmanResolved);

const modbusApi = new ModbusAPI(log, host, 502, unitId, device);

const perform = async (): Promise<void> => {
    await solarmanApi.connect();
    await solarmanApi.readRegistersInBatch();

    modbusApi.onDataReceived = valueModbusResolved;
    await modbusApi.connect();

    await modbusApi.readRegistersInBatch();
    /*
    if (device && device.supportedFlows && device.supportedFlows.actions && device.supportedFlows.actions.set_timing_ac_charge_on) {
        const args = {
            acpchgmax: 2,
            acsocmaxchg: 3,
        };
        device.supportedFlows.actions.set_timing_ac_charge_on(log, args, api);
    }
*/
    //    await api.writeRegister(workModeRegister!, 1);
    /*
    const address = DeviceRepository.getRegisterByTypeAndAddress(device, 'input', 507);

    if (address) {
        await api.readAddress(address, RegisterType.Input);
    } else {
        log.error('Address not found');
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
        modbusApi.disconnect();
        solarmanApi.disconnect();

        let output = '';

        output += '| Capability | Modbus | Solarman | \n';
        output += '| ---------- | ------ | -------- | \n';
        mixedResults.forEach((result) => {
            output += '| ' + result.capabilityId + ' | ' + result.modbus + ' | ' + result.solarman + '| \n';
        });

        fs.writeFileSync('./.build/diff.md', output);
    });
