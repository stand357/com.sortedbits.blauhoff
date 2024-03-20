/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusAPI } from '../../api/modbus/modbus-api';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { DeviceRepository } from '../../api/modbus/device-repository/device-repository';
import { Brand } from '../../api/modbus/models/brand';
// import { mod_tl3_registers } from '../../drivers/blauhoff-modbus/devices/growatt/mod-XXXX-tl3';
import { Logger } from '../../helpers/log';

const host = '10.210.5.12';
const port = 502;
const unitId = 1;
const log = new Logger();

const valueResolved = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value);
    log.log(register.capabilityId, result);
};

const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Growatt, 'growatt-tl3');

if (!device) {
    log.error('Device not found');
} else {
    const api = new ModbusAPI(log, host, port, unitId, device!.definition);

    api.connect().then((result) => {
        api.onDataReceived = valueResolved;

        api.readRegisters().then(() => {
            log.log('readRegisters done');
            api.disconnect();
        }).catch((error) => {
            log.error('error', error);
        });
    }).catch((error) => {
        log.error('error', error);
    }).finally(() => {
    });
}
