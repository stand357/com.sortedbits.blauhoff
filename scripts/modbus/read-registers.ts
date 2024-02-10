import { ModbusAPI } from '../../api/modbus/modbus-api';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { mod_tl3_registers } from '../../drivers/blauhoff-modbus/definitions/growatt/mod-XXXX-tl3';
import { Logger } from '../../helpers/log';

const host = '10.210.5.12';
const port = 502;
const unitId = 1;
const log = new Logger();

/*
ModbusAPI.verifyConnection(log, host, port, unitId, getRegisters()).then((result) => {
    console.log('then', result);
}).catch((error) => {
    console.error('error', error);
}).finally(() => {
    console.log('finally');
});
*/

const valueResolved = async (value: any, register: ModbusRegister) => {
    const result = register.calculateValue(value);
    log.log(register.capabilityId, result);
};

const api = new ModbusAPI(log, host, port, unitId, mod_tl3_registers);

const readRegisters = () => {
    api.readRegisters().then(() => {
        setTimeout(() => {
            readRegisters();
        }, 1000);
    }).catch((error) => {
        log.error('readRegisters', error);
    });
};

api.connect().then((result) => {
    api.onDataReceived = valueResolved;
    readRegisters();
}).catch((error) => {
    log.error('error', error);
}).finally(() => {
});
