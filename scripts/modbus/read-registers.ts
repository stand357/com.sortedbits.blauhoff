import { ModbusAPI } from '../../api/modbus/modbus-api';
import { ModbusRegister } from '../../api/modbus/models/modbus-register';
import { blauhoffRegisters } from '../../drivers/blauhoff-modbus/definitions/blauhoff';
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

const valueResolved = (value: any, register: ModbusRegister) => {
    console.log(register.capabilityId, value);
};

const api = new ModbusAPI(log, host, port, unitId, blauhoffRegisters);

api.connect().then((result) => {
    api.valueResolved = valueResolved;
    api.readRegisters();
}).catch((error) => {
    console.error('error', error);
}).finally(() => {
});
