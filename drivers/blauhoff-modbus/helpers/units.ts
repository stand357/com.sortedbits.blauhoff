export const unitForCapability = (capabilityId: string): string => {
    const parts = capabilityId.split('.');
    if (parts.length === 0) {
        return '';
    }

    const capability = parts[0];

    switch (capability) {
        case 'measure_voltage':
            return 'V';
        case 'measure_current':
            return 'A';
        case 'measure_power':
            return 'W';
        case 'measure_state_of_charge':
            return '%';
        case 'measure_temperature':
            return '°C';
        case 'meter_power':
            return 'kWh';

        default: return '';
    }
};
