import { blauhoff_spha } from '../definitions/blauhoff/spha';
import { mod_tl_registers } from '../definitions/growatt/mod-XXXX-tl';
import { mod_tl3_registers } from '../definitions/growatt/mod-XXXX-tl3';
import { Brand } from '../models/brand';
import { DeviceModel } from '../models/model';

export const growattTL: DeviceModel = {
    id: 'growatt-tl',
    brand: Brand.Growatt,
    name: 'Growatt 1PH MIC TL-X series',
    description: 'Single phase Growatt string inverters with MODBUS interface.',
    getDefinition: () => mod_tl_registers,
};

export const growattTL3: DeviceModel = {
    id: 'growatt-tl3',
    brand: Brand.Growatt,
    name: 'Growatt 3PH MOD TL3-X series',
    description: 'Three phase Growatt string inverters with MODBUS interface.',
    getDefinition: () => mod_tl3_registers,
};

export const blauhoffSPHA: DeviceModel = {
    id: 'blauhoff-1',
    brand: Brand.Blauhoff,
    name: 'Blauhoff SPHA',
    description: 'Blauhoff SPHA series of string inverters with MODBUS interface.',
    getDefinition: () => blauhoff_spha,
};

export const models = [growattTL, growattTL3, blauhoffSPHA];
