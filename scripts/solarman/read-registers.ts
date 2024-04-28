/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { DeviceRepository } from '../../api/modbus/device-repository/device-repository';
import { Brand } from '../../api/modbus/models/enum/brand';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { Solarman } from '../../api/solarman/solarman';
import { Logger } from '../../helpers/log';

const host = '10.210.5.17';
const log = new Logger();

const valueResolved = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value, log);
    log.log(register.capabilityId, ':', result);
};

//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Deye, 'deye-sun-xk-sg01hp3-eu-am2');
const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Afore, 'afore-hybrid-inverter');
//const device = DeviceRepository.getDeviceByBrandAndModel(Brand.Growatt, 'growatt-tl3');

if (!device) {
    log.error('Device not found');
    process.exit(1);
}

const api = new Solarman(log, device, host, '3518024876');
api.setOnDataReceived(valueResolved);

const perform = async (): Promise<void> => {
    await api.readRegistersInBatch();
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
    })
    .catch(log.error)
    .finally(() => {});
