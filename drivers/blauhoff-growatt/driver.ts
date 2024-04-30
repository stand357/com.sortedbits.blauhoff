/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { Brand } from '../../api/modbus/models/enum/brand';
import { BaseDriver } from '../../models/base-driver';

class BlauhoffGrowattDriver extends BaseDriver {
    onInit = async (): Promise<void> => {
        await super.onInit();

        this.pairingDeviceModelId = 'growatt-tl3';
        this.pairingDeviceBrand = Brand.Growatt;
    };
}

module.exports = BlauhoffGrowattDriver;
