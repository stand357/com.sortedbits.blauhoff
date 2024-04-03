/*
 * Created on Fri Mar 22 2024
 * Copyright © 2024 Wim Haanstra
 *
 * Non-commercial use only
 */
import ModbusRTU from 'modbus-serial';
import { RegisterDataType } from '../../models/enum/register-datatype';
import { ModbusRegister } from '../../models/modbus-register';
import { ModbusDeviceDefinition } from '../../models/modbus-device-registers';
import { Brand } from '../../models/enum/brand';
import { DeviceModel } from '../../models/device-model';
import { defaultValueConverter } from '../_shared/default-value-converter';
import { IBaseLogger } from '../../../../helpers/log';
import { AccessMode } from '../../models/enum/access-mode';

const inputRegisters: ModbusRegister[] = [];

const holdingRegisters: ModbusRegister[] = [
    // settings
    ModbusRegister.default('status_code.modbus_address', 1, 1, RegisterDataType.UINT16),
    ModbusRegister.default('status_code.modbus_protocol', 2, 1, RegisterDataType.UINT16),
    ModbusRegister.scale('status_code.max_sell_power', 143, 1, RegisterDataType.UINT16, 10, AccessMode.ReadWrite),

    ModbusRegister.default('serial', 3, 5, RegisterDataType.STRING),

    ModbusRegister.transform(
        'status_text.sell_solar',
        145,
        1,
        RegisterDataType.UINT16,
        (value) => {
            return value === 1 ? 'Yes' : 'No';
        },
        AccessMode.ReadWrite,
    ),

    ModbusRegister.transform(
        'status_text.work_mode',
        142,
        1,
        RegisterDataType.UINT16,
        (value) => {
            if (value === 0) {
                return 'Selling First';
            } else if (value === 1) {
                return 'Zero Export To Load';
            } else if (value === 2) {
                return 'Zero Export To CT';
            } else {
                return 'Unknown'; // Je kunt hier ook een andere fallback waarde kiezen
            }
        },
        AccessMode.ReadWrite,
    ),

    ModbusRegister.transform('status_text.run_mode', 500, 1, RegisterDataType.UINT16, (value) => {
        if (value === 0) {
            return 'Standby';
        } else if (value === 1) {
            return 'Selftest';
        } else if (value === 2) {
            return 'Normal';
        } else if (value === 3) {
            return 'Alarm';
        } else if (value === 4) {
            return 'Fault';
        } else {
            return 'Unknown'; // Je kunt hier ook een andere fallback waarde kiezen
        }
    }),

    // meters
    ModbusRegister.scale('meter_power.daily_from_grid', 520, 1, RegisterDataType.UINT16, 0.1), // day gridbuy
    ModbusRegister.scale('meter_power.daily_to_grid', 521, 1, RegisterDataType.UINT16, 0.1), // day gridsell
    ModbusRegister.scale('meter_power.total_from_grid', 522, 2, RegisterDataType.UINT16, 0.1), // total gridbuy
    ModbusRegister.scale('meter_power.total_to_grid', 524, 2, RegisterDataType.UINT16, 0.1), // total gridsell
    ModbusRegister.scale('meter_power.daily_to_load', 526, 1, RegisterDataType.UINT16, 0.1), // consumption day
    ModbusRegister.scale('meter_power.total_to_load', 527, 2, RegisterDataType.UINT16, 0.1), // total consumption
    ModbusRegister.scale('meter_power.daily_pv', 529, 1, RegisterDataType.UINT16, 0.1), // day pv power
    ModbusRegister.scale('meter_power.total_pv', 534, 2, RegisterDataType.UINT16, 0.1), // total PV power
    ModbusRegister.scale('meter_power.daily_battery_charge', 514, 1, RegisterDataType.UINT16, 0.1), // day batt charge
    ModbusRegister.scale('meter_power.daily_battery_discharge', 515, 1, RegisterDataType.UINT16, 0.1), // day batt discharge
    ModbusRegister.scale('meter_power.total_battery_charge', 516, 2, RegisterDataType.UINT16, 0.1), // total batt charge
    ModbusRegister.scale('meter_power.total_battery_discharge', 518, 2, RegisterDataType.UINT16, 0.1), // total batt discharge
    // pv
    ModbusRegister.scale('measure_power.pv1', 672, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_power.pv2', 673, 1, RegisterDataType.UINT16, 0.1),

    ModbusRegister.scale('measure_current.pv1', 677, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_current.pv2', 679, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.pv1', 676, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.pv2', 678, 1, RegisterDataType.UINT16, 0.1),

    // grid
    ModbusRegister.default('measure_power.grid', 625, 1, RegisterDataType.UINT16),
    ModbusRegister.default('measure_power.total_active_in_power', 607, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_int_ctl1', 604, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_int_ctl2', 605, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_int_ctl3', 606, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_ext_ctl1', 616, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_ext_ctl2', 617, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.grid_ext_ctl3', 618, 1, RegisterDataType.INT16),

    ModbusRegister.scale('measure_voltage.grid_l1', 598, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.grid_l2', 599, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.grid_l3', 600, 1, RegisterDataType.UINT16, 0.1),

    // generator
    // ModbusRegister.scale('measure_power.gen_port', 667, 1, RegisterDataType.UINT16, 0),
    // inverter
    ModbusRegister.default('measure_power.inverter', 636, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.inverter_l1', 633, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.inverter_l2', 634, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.inverter_l3', 635, 1, RegisterDataType.INT16),

    ModbusRegister.scale('measure_current.inverter_l1', 630, 1, RegisterDataType.INT16, 0.01),
    ModbusRegister.scale('measure_current.inverter_l2', 631, 1, RegisterDataType.INT16, 0.01),
    ModbusRegister.scale('measure_current.inverter_l3', 632, 1, RegisterDataType.INT16, 0.01),
    ModbusRegister.scale('measure_voltage.inverter_l1', 627, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.inverter_l2', 628, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.inverter_l3', 629, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_temperature.ac', 541, 1, RegisterDataType.UINT16, 0.1),

    // battery
    ModbusRegister.default('measure_power.battery1', 590, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.battery2', 595, 1, RegisterDataType.INT16),

    ModbusRegister.scale('measure_current.battery1', 591, 1, RegisterDataType.INT16, 0.01),
    ModbusRegister.scale('measure_current.battery2', 594, 1, RegisterDataType.INT16, 0.01),
    ModbusRegister.scale('measure_voltage.battery1', 587, 1, RegisterDataType.INT16, 0.1),
    ModbusRegister.scale('measure_voltage.battery2', 593, 1, RegisterDataType.INT16, 0.1),

    ModbusRegister.default('measure_percentage.battery1', 588, 1, RegisterDataType.UINT16), // SOC
    ModbusRegister.default('measure_percentage.battery2', 589, 1, RegisterDataType.UINT16), // SOC

    ModbusRegister.scale('measure_temperature.battery1', 586, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_temperature.battery2', 596, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_temperature.dc', 540, 1, RegisterDataType.UINT16, 0.1),

    // load
    ModbusRegister.default('measure_power.load', 653, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.load_l1', 650, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.load_l2', 651, 1, RegisterDataType.INT16),
    ModbusRegister.default('measure_power.load_l3', 652, 1, RegisterDataType.INT16),

    ModbusRegister.scale('measure_voltage.load_l1', 644, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.load_l2', 645, 1, RegisterDataType.UINT16, 0.1),
    ModbusRegister.scale('measure_voltage.load_l3', 646, 1, RegisterDataType.UINT16, 0.1),
];

const enableSellSolar = async (origin: IBaseLogger, args: any, client: ModbusRTU): Promise<void> => {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16BE(0x1, 0);

    origin.filteredLog('Writing register 145: ', buffer, buffer.byteLength);

    try {
        const result = await client.writeRegisters(145, buffer);
        origin.filteredLog('Output', result.address);
    } catch (error) {
        origin.error('Error enabling solar selling', error);
    }
};

const disableSellSolar = async (origin: IBaseLogger, args: any, client: ModbusRTU): Promise<void> => {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16BE(0, 0);

    origin.filteredLog('Writing register 145: ', buffer, buffer.byteLength);

    try {
        await client.writeRegisters(145, buffer);
    } catch (error) {
        origin.error('Error disabling solar selling', error);
    }
};

// eslint-disable-next-line camelcase
const definition: ModbusDeviceDefinition = {
    inputRegisters,
    holdingRegisters,
    inputRegisterResultConversion: defaultValueConverter,
    holdingRegisterResultConversion: defaultValueConverter,
    actions: {
        enableSellSolar,
        disableSellSolar,
    },
    deprecatedCapabilities: ['status_code.work_mode', 'status_code.run_mode'],
};

export const deyeSunXKSG01HP3: DeviceModel = {
    id: 'deye-sun-xk-sg01hp3-eu-am2',
    brand: Brand.Deye,
    name: 'Deye Sun *K SG01HP3 EU AM2 Series',
    description: 'Deye Sun *K SG01HP3 EU AM2 Series with modbus interface',
    debug: true,
    definition,
};
