/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { DeviceInformation } from '../../../models/device-information';
import { Brand } from '../../../models/enum/brand';
import { holdingRegisters } from './holding-registers';
import { inputRegisters } from './input-registers';

export class GrowattTLX extends DeviceInformation {
    constructor() {
        super('growatt-tl', Brand.Growatt, 'Growatt 1PH MIC TL-X series', 'Single phase Growatt string inverters with MODBUS interface.');

        this.supportsSolarman = true;
        this.deprecatedCapabilities = ['measure_power.l1', 'measure_power.l2', 'measure_power.l3'];

        this.addInputRegisters(inputRegisters);
        this.addHoldingRegisters(holdingRegisters);
    }
}
