interface CapabilityDefinition {
    title: { [key: string]: string },
    id: string;
    valueMultiplier?: number;
}
export const deviceInfoMapping: { [key: string]: CapabilityDefinition } = {
    sys_device_type: {
        title: { en: 'Device type' },
        id: 'status_code.device_type',
    },
    manufacturer: {
        title: { en: 'Manufacturer' },
        id: 'manufacturer',
    },
    serial: {
        title: { en: 'Serial number' },
        id: 'serial',
    },
    dsp1_version: {
        title: { en: 'DSP 1 version' },
        id: 'version.dsp1',
    },
    dsp2_version: {
        title: { en: 'DSP 2 version' },
        id: 'version.dsp2',
    },
    bms_software_version: {
        title: { en: 'BMS version' },
        id: 'version.bms',
    },
    ems_hardware_version: {
        title: { en: 'EMS version' },
        id: 'version.ems',
    },
    sys_run_mode: {
        title: { en: 'Run mode' },
        id: 'status_code.run_mode',
    },
    bat_basic_status: {
        title: { en: 'Battery status' },
        id: 'status_code.bat_basic_status',
    },
    sys_error_code: {
        title: { en: 'Error code' },
        id: 'status_code.sys_error_code',
    },
    sys_bat_error_code: {
        title: { en: 'Battery error code' },
        id: 'status_code.sys_bat_error_code',
    },

    pv1_v: {
        title: { en: 'PV1 voltage' },
        id: 'measure_voltage.pv1',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    pv1_i: {
        title: { en: 'PV1 current' },
        id: 'measure_current.pv1',
        valueMultiplier: 10,
    }, // unit 0.1A, 10=1A
    pv2_v: {
        title: { en: 'PV2 voltage' },
        id: 'measure_voltage.pv2',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    pv2_i: {
        title: { en: 'PV2 current' },
        id: 'measure_current.pv2',
        valueMultiplier: 10,
    }, // unit 0.1A, 10=1A
    pv1_p: {
        title: { en: 'PV1 power' },
        id: 'measure_power.pv1',
    }, // W
    pv2_p: {
        title: { en: 'PV2 power' },
        id: 'measure_power.pv2',
    }, // W

    ac_v: {
        title: { en: 'AC voltage' },
        id: 'measure_voltage.ac',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    ac_i: {
        title: { en: 'AC current' },
        id: 'measure_current.ac',
        valueMultiplier: 10,
    }, // unit 0.1A, 10=1A
    ac_f: {
        title: { en: 'AC frequency' },
        id: 'measure_frequency.ac',
        valueMultiplier: 100,
    }, // unit 0.01Hz, 100=1Hz
    ac_p: {
        title: { en: 'AC power' },
        id: 'measure_power.ac',
    }, // W
    ac_q: {
        title: { en: 'AC voltamperage' },
        id: 'measure_voltamperage.ac',
        valueMultiplier: 100,
    }, // VA
    // ac_power_factor, // 0.01

    eps_v: {
        title: { en: 'EPS voltage' },
        id: 'measure_voltage.eps',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    eps_i: {
        title: { en: 'EPS current' },
        id: 'measure_current.eps',
        valueMultiplier: 10,
    }, // unit 0.1A, 10=1A
    eps_p: {
        title: { en: 'EPS power' },
        id: 'measure_power.eps',
    }, // W
    eps_q: {
        title: { en: 'EPS voltamperage' },
        id: 'measure_voltamperage.eps',
        valueMultiplier: 100,
    }, // VA

    meter_v: {
        title: { en: 'Meter voltage' },
        id: 'measure_voltage.meter',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    meter_i: {
        title: { en: 'Meter current' },
        id: 'measure_current.meter',
        valueMultiplier: 10,
    }, // unit 0.1A, 10=1A
    meter_f: {
        title: { en: 'Meter frequency' },
        id: 'measure_frequency.meter',
        valueMultiplier: 100,
    }, // unit 0.01Hz, 100=1Hz
    meter_p: {
        title: { en: 'Meter power' },
        id: 'measure_power.meter',
    }, // W
    meter_q: {
        title: { en: 'Meter voltamperage' },
        id: 'measure_voltamperage.meter',
        valueMultiplier: 100,
    }, // VA
    // meter_power_factor, // 0.01

    bat_v: {
        title: { en: 'Battery voltage' },
        id: 'measure_voltage.battery',
        valueMultiplier: 10,
    }, // unit 0.1V, 10=1V
    bat_i: {
        title: { en: 'Battery current' },
        id: 'measure_current.battery',
        valueMultiplier: 100,
    }, // unit 0.01A, 100=1A
    bat_p: {
        title: { en: 'Battery power' },
        id: 'measure_power.battery',
    }, // W
    bat_soc: {
        title: { en: 'State of charge' },
        id: 'measure_state_of_charge.battery',
    }, // 1
    bat_soh: {
        title: { en: 'Battery SOH' },
        id: 'status_code.bat_soh',
    }, // 1

    bat_voltage_high: {
        title: { en: 'Battery voltage high' },
        id: 'measure_voltage.battery_high',
        valueMultiplier: 1000,
    }, // unit 0.001V, 1000=1V
    // bat_voltage_high_id,
    bat_voltage_low: {
        title: { en: 'Battery voltage low' },
        id: 'measure_voltage.battery_low',
        valueMultiplier: 1000,
    }, // unit 0.001V, 1000=1V
    // bat_voltage_low_id,
    bat_temp_high: {
        title: { en: 'Battery temperature high' },
        id: 'measure_temperature.battery_high',
        valueMultiplier: 10,
    }, // unit 0.1°C，10=1°C
    // bat_temp_high_id,
    bat_temp_low: {
        title: { en: 'Battery temperature low' },
        id: 'measure_temperature.battery_low',
        valueMultiplier: 10,
    }, // unit 0.1°C，10=1°C

    // bat_temp_low_id,
    bat_e_total_charge: {
        title: { en: 'Battery total charge' },
        id: 'meter_power.battery_total_charge',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
    bat_e_total_discharge: {
        title: { en: 'Battery total discharge' },
        id: 'meter_power.battery_total_discharge',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
    meter_p_pv: {
        title: { en: 'PV total' },
        id: 'meter_power.pv',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_to_grid: {
        title: { en: 'Total to grid' },
        id: 'meter_power.total_to_grid',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_from_grid: {
        title: { en: 'Total from grid' },
        id: 'meter_power.total_from_grid',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_to_grid_pv: {
        title: { en: 'PV total to grid' },
        id: 'meter_power.total_to_grid_pv',
        valueMultiplier: 10,
    }, // unit 0.1kWh, 10=1kWh
};
