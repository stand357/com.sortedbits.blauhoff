import { ModbusAPI } from '../../api/modbus/modbus-api';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { blauhoff_spha } from '../../drivers/blauhoff-modbus/devices/blauhoff/spha';
// import { mod_tl3_registers } from '../../drivers/blauhoff-modbus/devices/growatt/mod-XXXX-tl3';
import { Logger } from '../../helpers/log';

const host = '88.159.155.195'; // '10.210.5.12';
const port = 502;
const unitId = 1;
const log = new Logger();

const valueResolved = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value);
    log.log(register.capabilityId, result);
};

const api = new ModbusAPI(log, host, port, unitId, blauhoff_spha);

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
