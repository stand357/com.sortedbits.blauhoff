import { WriteMultipleResult } from 'modbus-serial/ModbusRTU';
import { Logger } from '../../../../helpers/log';
import { deyeSunXKSG01HP3 } from '../../device-repository/deye/sun-xk-sg01hp3-eu-am2';
import ModbusRTU from 'modbus-serial';

describe('deye-sun-xk-sg01hp3-eu-am2', () => {
    const logger = new Logger();
    const client = new ModbusRTU();

    let spy = jest.spyOn(client, 'writeRegisters').mockImplementation((dataAddress: number, values: number[] | Buffer): Promise<WriteMultipleResult> => {
        return new Promise((resolve) => {
            resolve({
                address: dataAddress,
                length: 2,
            });
        });
    });

    test('enable-sell-solar', async () => {
        await deyeSunXKSG01HP3.definition.actions?.enableSellSolar(logger, {}, client);
        const buffer = Buffer.alloc(2);
        buffer.writeInt16BE(0x1, 0);
        expect(client.writeRegisters).toHaveBeenCalledWith(145, buffer);
    });

    test('disable-sell-solar', async () => {
        await deyeSunXKSG01HP3.definition.actions?.disableSellSolar(logger, {}, client);
        const buffer = Buffer.alloc(2);
        buffer.writeInt16BE(0x1, 0);
        expect(client.writeRegisters).toHaveBeenCalledWith(145, buffer);
    });
});
