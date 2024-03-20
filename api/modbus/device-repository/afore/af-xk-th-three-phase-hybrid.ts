/*
 * Created on Wed Mar 20 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */

import { RegisterDataType } from '../../models/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/brand';
import { DeviceModel } from '../../models/device-model';
import { defaultValueConverter } from '../_shared/default-value-converter';

/**
 * This is the list of registers for the Deye Modbus device.
 *
 * Field 1: Address
 * Field 2: Length
 * Field 3: Data Type
 * Field 4: Scale
 * Field 5: Capability ID
 * Field 6: Calculation that needs to be performed on the value
 */
const inputRegisters = [
    ModbusRegister.default('status_code.run_mode', 2500, 2, RegisterDataType.UINT16),

    ModbusRegister.scale('measure_voltage.pv1', 555, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.pv2', 558, 2, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('measure_power.pv1', 557, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_power.pv2', 560, 2, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('measure_power', 553, 4, RegisterDataType.UINT32, 0.1),

    ModbusRegister.scale('measure_voltage.phase1', 507, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.phase2', 508, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.phase3', 509, 2, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('meter_power.today', 1000, 2, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('meter_power', 1014, 4, RegisterDataType.UINT32, 0.1),
];

const holdingRegisters: ModbusRegister[] = [
];

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
};

export const aforeAFXKTH: DeviceModel = {
    id: 'afore-hybrid-inverter',
    brand: Brand.Afore,
    name: 'Afore AF XK-TH Three Phase Hybrid Inverter',
    description: 'Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface',
    debug: true,
    definition,
};
