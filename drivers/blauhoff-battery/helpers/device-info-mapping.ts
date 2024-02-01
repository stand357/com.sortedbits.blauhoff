interface CapabilityDefinition {
    title: { [key: string]: string },
    id: string;
}
export const deviceInfoMapping: { [key: string]: CapabilityDefinition } = {
    sys_device_type: {
        title: { en: '' },
        id: 'status_code.device_type',
    },
    manufacturer: {
        title: { en: '' },
        id: 'manufacturer',
    },
    serial: {
        title: { en: '' },
        id: 'serial',
    },
    dsp1_version: {
        title: { en: '' },
        id: 'version.dsp1',
    },
    dsp2_version: {
        title: { en: '' },
        id: 'version.dsp2',
    },
    bms_software_version: {
        title: { en: '' },
        id: 'version.bms',
    },
    ems_hardware_version: {
        title: { en: '' },
        id: 'version.ems',
    },
    sys_run_mode: {
        title: { en: '' },
        id: 'status_code.run_mode',
    },
    bat_basic_status: {
        title: { en: '' },
        id: 'status_code.bat_basic_status',
    },
    sys_error_code: {
        title: { en: '' },
        id: 'status_code.sys_error_code',
    },
    sys_bat_error_code: {
        title: { en: '' },
        id: 'status_code.sys_bat_error_code',
    },

    pv1_v: {
        title: { en: '' },
        id: 'measure_voltage.pv1',
    }, // unit 0.1V, 10=1V
    pv1_i: {
        title: { en: '' },
        id: 'measure_current.pv1',
    }, // unit 0.1A, 10=1A
    pv2_v: {
        title: { en: '' },
        id: 'measure_voltage.pv2',
    }, // unit 0.1V, 10=1V
    pv2_i: {
        title: { en: '' },
        id: 'measure_current.pv2',
    }, // unit 0.1A, 10=1A
    pv1_p: {
        title: { en: '' },
        id: 'measure_power.pv1',
    }, // W
    pv2_p: {
        title: { en: '' },
        id: 'measure_power.pv2',
    }, // W

    ac_v: {
        title: { en: '' },
        id: 'measure_voltage.ac',
    }, // unit 0.1V, 10=1V
    ac_i: {
        title: { en: '' },
        id: 'measure_current.ac',
    }, // unit 0.1A, 10=1A
    ac_f: {
        title: { en: '' },
        id: 'measure_frequency.ac',
    }, // unit 0.01Hz, 100=1Hz
    ac_p: {
        title: { en: '' },
        id: 'measure_power.ac',
    }, // W
    ac_q: {
        title: { en: '' },
        id: 'measure_voltamperage.ac',
    }, // VA
    // ac_power_factor, // 0.01

    eps_v: {
        title: { en: '' },
        id: 'measure_voltage.eps',
    }, // unit 0.1V, 10=1V
    eps_i: {
        title: { en: '' },
        id: 'measure_current.eps',
    }, // unit 0.1A, 10=1A
    eps_p: {
        title: { en: '' },
        id: 'measure_power.eps',
    }, // W
    eps_q: {
        title: { en: '' },
        id: 'measure_voltamperage.eps',
    }, // VA

    meter_v: {
        title: { en: '' },
        id: 'measure_voltage.meter',
    }, // unit 0.1V, 10=1V
    meter_i: {
        title: { en: '' },
        id: 'measure_current.meter',
    }, // unit 0.1A, 10=1A
    meter_f: {
        title: { en: '' },
        id: 'measure_frequency.meter',
    }, // unit 0.01Hz, 100=1Hz
    meter_p: {
        title: { en: '' },
        id: 'measure_power.meter',
    }, // W
    meter_q: {
        title: { en: '' },
        id: 'measure_voltamperage.meter',
    }, // VA
    // meter_power_factor, // 0.01

    bat_v: {
        title: { en: '' },
        id: 'measure_voltage.battery',
    }, // unit 0.1V, 10=1V
    bat_i: {
        title: { en: '' },
        id: 'measure_current.battery',
    }, // unit 0.01A, 100=1A
    bat_p: {
        title: { en: '' },
        id: 'measure_power.battery',
    }, // W
    bat_soc: {
        title: { en: '' },
        id: 'status_code.bat_soc',
    }, // 1
    bat_soh: {
        title: { en: '' },
        id: 'status_code.bat_soh',
    }, // 1

    bat_voltage_high: {
        title: { en: '' },
        id: 'measure_voltage.battery_high',
    }, // unit 0.001V, 1000=1V bat_voltage_high_id,
    bat_voltage_low: {
        title: { en: '' },
        id: 'measure_voltage.battery_low',
    }, // unit 0.001V, 1000=1V bat_voltage_low_id,
    bat_temp_high: {
        title: { en: '' },
        id: 'measure_temperature.battery_high',
    }, // unit 0.1°C，10=1°C bat_temp_high_id,
    bat_temp_low: {
        title: { en: '' },
        id: 'measure_temperature.battery_low',
    }, // unit 0.1°C，10=1°C

    // bat_temp_low_id,
    bat_e_total_charge: {
        title: { en: '' },
        id: 'meter_power.battery_total_charge',
    }, // unit 0.1kWh, 10=1kWh
    bat_e_total_discharge: {
        title: { en: '' },
        id: 'meter_power.battery_total_discharge',
    }, // unit 0.1kWh, 10=1kWh
    meter_p_pv: {
        title: { en: '' },
        id: 'meter_power.pv',
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_to_grid: {
        title: { en: '' },
        id: 'meter_power.total_to_grid',
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_from_grid: {
        title: { en: '' },
        id: 'meter_power.total_from_grid',
    }, // unit 0.1kWh, 10=1kWh
    electricity_e_total_to_grid_pv: {
        title: { en: '' },
        id: 'meter_power.total_to_grid_pv',
    }, // unit 0.1kWh, 10=1kWh
};
