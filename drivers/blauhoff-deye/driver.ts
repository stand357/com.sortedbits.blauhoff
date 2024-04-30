/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { Brand } from '../../api/modbus/models/enum/brand';
import { BaseDriver } from '../../models/base-driver';

class BlauhoffDeyeDriver extends BaseDriver {
    onInit = async (): Promise<void> => {
        await super.onInit();

        this.pairingDeviceModelId = 'deye-sun-xk-sg01hp3-eu-am2';
        this.pairingDeviceBrand = Brand.Deye;
    };
}

module.exports = BlauhoffDeyeDriver;
