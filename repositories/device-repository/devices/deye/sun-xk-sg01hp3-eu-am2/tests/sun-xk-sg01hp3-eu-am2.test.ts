import { RegisterType } from '../../../../models/enum/register-type';
import { DeyeSunXKSG01HP3 } from '../sun-xk-sg01hp3-eu-am2';

describe('Device', () => {
    let device: DeyeSunXKSG01HP3;
    let mockLogger: any;
    let mockClient: any;

    beforeEach(() => {
        device = new DeyeSunXKSG01HP3();
        mockLogger = {
            filteredError: jest.fn(),
            filteredLog: jest.fn(),
        };
        mockClient = {
            writeRegister: jest.fn(),
            readAddressWithoutConversion: jest.fn().mockResolvedValue(Buffer.from([0x00, 0x00])),
            writeBufferRegister: jest.fn().mockResolvedValue(true),
        };
    });

    test('setSolarSell', async () => {
        const register = device.getRegisterByTypeAndAddress(RegisterType.Holding, 145);
        if (register) {
            await device.setSolarSell(mockLogger, { enabled: true }, mockClient);
            expect(mockLogger.filteredLog).toHaveBeenCalledWith('Setting solar selling to: ', true);
            expect(mockClient.writeRegister).toHaveBeenCalledWith(register, 1);

            await device.setSolarSell(mockLogger, { enabled: false }, mockClient);
            expect(mockLogger.filteredLog).toHaveBeenCalledWith('Setting solar selling to: ', false);
            expect(mockClient.writeRegister).toHaveBeenCalledWith(register, 0);
        }
    });

    test('setMaxSolarPower', async () => {
        const register = device.getRegisterByTypeAndAddress(RegisterType.Holding, 340);
        if (register) {
            const payload = register.calculatePayload(5000, mockLogger);

            await device.setMaxSolarPower(mockLogger, { value: 5000 }, mockClient);
            expect(mockLogger.filteredLog).toHaveBeenCalledWith('Setting max solar power to: ', 5000);
            expect(mockClient.writeRegister).toHaveBeenCalledWith(register, payload);

            await device.setMaxSolarPower(mockLogger, { value: 9000 }, mockClient);
            expect(mockLogger.filteredError).toHaveBeenCalledWith('Value out of range');
        }
    });

    test('setMaxSellPower', async () => {
        const register = device.getRegisterByTypeAndAddress(RegisterType.Holding, 143);
        if (register) {
            const payload = register.calculatePayload(5000, mockLogger);

            await device.setMaxSellPower(mockLogger, { value: 5000 }, mockClient);
            expect(mockLogger.filteredLog).toHaveBeenCalledWith('Setting max sell power to: ', 5000);
            expect(mockClient.writeRegister).toHaveBeenCalledWith(register, payload);

            await device.setMaxSellPower(mockLogger, { value: 9000 }, mockClient);
            expect(mockLogger.filteredLog).toHaveBeenCalledWith('Setting max sell power to: ', 9000);
            expect(mockClient.writeRegister).toHaveBeenCalledWith(register, payload);

            await device.setMaxSellPower(mockLogger, { value: 90000 }, mockClient);
            expect(mockLogger.filteredError).toHaveBeenCalledWith('Value out of range');
        }
    });
});
