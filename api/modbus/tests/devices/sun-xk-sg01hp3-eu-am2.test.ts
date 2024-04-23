import { WriteMultipleResult } from 'modbus-serial/ModbusRTU';
import { Logger } from '../../../../helpers/log';
import { deyeSunXKSG01HP3 } from '../../device-repository/deye/sun-xk-sg01hp3-eu-am2';
import ModbusRTU from 'modbus-serial';

describe('deye-sun-xk-sg01hp3-eu-am2', () => {
    const client = new ModbusRTU();

    let spy = jest.spyOn(client, 'writeRegisters').mockImplementation((dataAddress: number, values: number[] | Buffer): Promise<WriteMultipleResult> => {
        return new Promise((resolve) => {
            resolve({
                address: dataAddress,
                length: 2,
            });
        });
    });
});
