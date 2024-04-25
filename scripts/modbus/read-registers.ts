/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { ModbusAPI } from '../../api/modbus/modbus-api';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { DeviceRepository } from '../../api/modbus/device-repository/device-repository';
import { Brand } from '../../api/modbus/models/enum/brand';
// import { mod_tl3_registers } from '../../drivers/blauhoff-modbus/devices/growatt/mod-XXXX-tl3';
import { Logger } from '../../helpers/log';

const host = '10.210.5.16';
//const host = '88.159.155.195';
const port = 502;
const unitId = 1;
const log = new Logger();

const valueResolved = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value);
    log.log(register.capabilityId, result);
};

//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, 'deye-sun-xk-sg01hp3-eu-am2');
const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Afore, 'afore-hybrid-inverter');
//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Growatt, 'growatt-tl3');

if (!device) {
    log.error('Device not found');
    process.exit(1);
}

const api = new ModbusAPI(log, host, port, unitId, device!);

const perform = async (): Promise<void> => {
    api.onDataReceived = valueResolved;

    await api.connect();

    await api.readRegistersInBatch();
    //    await api.readRegisters();
};

perform()
    .then(() => {
        log.log('Performed test');
    })
    .catch(log.error)
    .finally(() => {
        api.disconnect();
    });
