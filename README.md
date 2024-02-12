# BlauHoff

Adds support for BlauHoff devices

![Workflow](https://github.com/sorted-bits/com.sortedbits.blauhoff/actions/workflows/node.js.yml/badge.svg)

## Authentication
For this Homey app to work, you need to have a valid `Access ID` and `Access Secret`. Those can be aquired by visiting [this URL](https://sortedbits.com).

## Registering your devices serial
For this app to work, you also need to bind your device to your account. During the pairing process in Homey, there is a field to enter your serial. If you specify your serial there, the device will be bound to your account.

## Flows
### Actions
The following actions are available in Homey flows:

- Set self consumption mode (VPP mode1)
- Set direct charge mode (VPP mode2)
- Set direct discharge mode (VPP mode3)
- Charge only，no discharging (VPP mode 4)
- Discharge only to the load, avoid charging (VPP mode 5)
- Inverter outputs at specified power (VPP mode 6)
- Inverter operates at the specified power (VPP mode 7)

# Modbus Register information

# BLAUHOFF
## Blauhoff SPHA
Blauhoff SPHA series of string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 36101 | 1 | UINT16 | 1 | status_code.run_mode | 0 |
| 36103 | 1 | UINT16 | 1 | status_code.sys_error_code | 0 |
| 36104 | 1 | UINT16 | 1 | status_code.sys_bat_error_code | 0 |
| 36108 | 1 | UINT16 | 0.1 | measure_voltage.pv1 | 0 |
| 36109 | 1 | UINT16 | 0.1 | measure_current.pv1 | 0 |
| 36110 | 1 | UINT16 | 0.1 | measure_voltage.pv2 | 0 |
| 36111 | 1 | UINT16 | 0.1 | measure_current.pv2 | 0 |
| 36112 | 1 | UINT16 | 1 | measure_power.pv1 | 0 |
| 36113 | 1 | UINT16 | 1 | measure_power.pv2 | 0 |
| 36117 | 2 | INT32 | 1 | measure_power.dsp | 0 |
| 36124 | 2 | INT32 | 1 | measure_power.eps | 0 |
| 36131 | 2 | INT32 | 1 | measure_power.grid_output | 0 |
| 36138 | 2 | INT32 | 1 | measure_power.battery | 0 |
| 36151 | 1 | UINT16 | 0.1 | measure_voltage.battery | 0 |
| 36155 | 1 | UINT16 | 1 | measure_state_of_charge.bat_soc | 0 |
| 36156 | 1 | UINT16 | 1 | measure_state_of_charge.bat_soh | 0 |
| 36161 | 1 | UINT16 | 0.1 | measure_temperature.battery_high | 0 |
| 36163 | 1 | UINT16 | 0.1 | measure_temperature.battery_low | 0 |
| 36201 | 2 | UINT32 | 0.1 | meter_power.battery_total_charge | 0 |
| 36203 | 2 | UINT32 | 0.1 | meter_power.battery_total_discharge | 0 |
| 36205 | 2 | INT32 | 1 | measure_power.pv | 0 |
| 36207 | 2 | UINT32 | 0.1 | meter_power.total_to_grid_pv | 0 |
| 36209 | 2 | UINT32 | 0.1 | meter_power.total_to_grid | 0 |
| 36211 | 2 | UINT32 | 0.1 | meter_power.total_from_grid | 0 |
| 36213 | 2 | UINT32 | 0.1 | meter_power.pv | 0 |

### Holding Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 60001 | 1 | UINT16 | 0.1 | status_code.work_mode | 0 |

# GROWATT
## Growatt 1PH MIC TL-X series
Single phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 0 | 2 | UINT16 | 0 | status_code.run_mode | 0 |
| 1 | 2 | UINT32 | 0.1 | measure_power.ac | 0 |
| 3 | 2 | UINT16 | 0.1 | measure_voltage.pv1 | 0 |
| 5 | 2 | UINT32 | 0.1 | measure_power.pv1 | 0 |
| 7 | 2 | UINT16 | 0.1 | measure_voltage.pv2 | 0 |
| 9 | 2 | UINT32 | 0.1 | measure_power.pv2 | 0 |
| 35 | 2 | UINT32 | 0.1 | measure_power | 0 |
| 38 | 2 | UINT16 | 0.1 | measure_voltage.phase1 | 0 |
| 53 | 2 | UINT32 | 0.1 | meter_power.today | 0 |
| 55 | 2 | UINT32 | 0.1 | meter_power | 0 |

### Holding Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 23 | 5 | STRING | 0 | serial | 0 |

## Growatt 3PH MOD TL3-X series
Three phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 0 | 2 | UINT16 | 0 | status_code.run_mode | 0 |
| 1 | 2 | UINT32 | 0.1 | measure_power.ac | 0 |
| 3 | 2 | UINT16 | 0.1 | measure_voltage.pv1 | 0 |
| 5 | 2 | UINT32 | 0.1 | measure_power.pv1 | 0 |
| 7 | 2 | UINT16 | 0.1 | measure_voltage.pv2 | 0 |
| 9 | 2 | UINT32 | 0.1 | measure_power.pv2 | 0 |
| 35 | 2 | UINT32 | 0.1 | measure_power | 0 |
| 38 | 2 | UINT16 | 0.1 | measure_voltage.phase1 | 0 |
| 42 | 2 | UINT16 | 0.1 | measure_voltage.phase2 | 0 |
| 46 | 2 | UINT16 | 0.1 | measure_voltage.phase3 | 0 |
| 53 | 2 | UINT32 | 0.1 | meter_power.today | 0 |
| 55 | 2 | UINT32 | 0.1 | meter_power | 0 |

### Holding Registers
| Address | Length | Data Type | Scale | Capability ID | Calculation |
| ------- | ------ | --------- | ----- | ------------- | ----------- |
| 23 | 5 | STRING | 0 | serial | 0 |

# DEYE
# KSTAR
