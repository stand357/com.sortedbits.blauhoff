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
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- | ----- | ------------- |
| 36101 | 1 | UINT16 |  | 1 | status_code.run_mode |
| 36103 | 1 | UINT16 |  | 1 | status_code.sys_error_code |
| 36104 | 1 | UINT16 |  | 1 | status_code.sys_bat_error_code |
| 36108 | 1 | UINT16 | V | 0.1 | measure_voltage.pv1 |
| 36109 | 1 | UINT16 | A | 0.1 | measure_current.pv1 |
| 36110 | 1 | UINT16 | V | 0.1 | measure_voltage.pv2 |
| 36111 | 1 | UINT16 | A | 0.1 | measure_current.pv2 |
| 36112 | 1 | UINT16 | W | 1 | measure_power.pv1 |
| 36113 | 1 | UINT16 | W | 1 | measure_power.pv2 |
| 36117 | 2 | INT32 | W | 1 | measure_power.dsp |
| 36124 | 2 | INT32 | W | 1 | measure_power.eps |
| 36131 | 2 | INT32 | W | 1 | measure_power.grid_output |
| 36138 | 2 | INT32 | W | 1 | measure_power.battery |
| 36151 | 1 | UINT16 | V | 0.1 | measure_voltage.battery |
| 36155 | 1 | UINT16 | % | 1 | measure_state_of_charge.bat_soc |
| 36156 | 1 | UINT16 | % | 1 | measure_state_of_charge.bat_soh |
| 36161 | 1 | UINT16 | °C | 0.1 | measure_temperature.battery_high |
| 36163 | 1 | UINT16 | °C | 0.1 | measure_temperature.battery_low |
| 36201 | 2 | UINT32 | kWh | 0.1 | meter_power.battery_total_charge |
| 36203 | 2 | UINT32 | kWh | 0.1 | meter_power.battery_total_discharge |
| 36205 | 2 | INT32 | W | 1 | measure_power.pv |
| 36207 | 2 | UINT32 | kWh | 0.1 | meter_power.total_to_grid_pv |
| 36209 | 2 | UINT32 | kWh | 0.1 | meter_power.total_to_grid |
| 36211 | 2 | UINT32 | kWh | 0.1 | meter_power.total_from_grid |
| 36213 | 2 | UINT32 | kWh | 0.1 | meter_power.pv |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- |----- | ------------- |
| 60001 | 1 | UINT16 |  | 0.1 | status_code.work_mode |

# GROWATT
## Growatt 1PH MIC TL-X series
Single phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- | ----- | ------------- |
| 0 | 2 | UINT16 |  | 0 | status_code.run_mode |
| 1 | 2 | UINT32 | W | 0.1 | measure_power.ac |
| 3 | 2 | UINT16 | V | 0.1 | measure_voltage.pv1 |
| 5 | 2 | UINT32 | W | 0.1 | measure_power.pv1 |
| 7 | 2 | UINT16 | V | 0.1 | measure_voltage.pv2 |
| 9 | 2 | UINT32 | W | 0.1 | measure_power.pv2 |
| 35 | 2 | UINT32 | W | 0.1 | measure_power |
| 38 | 2 | UINT16 | V | 0.1 | measure_voltage.phase1 |
| 53 | 2 | UINT32 | kWh | 0.1 | meter_power.today |
| 55 | 2 | UINT32 | kWh | 0.1 | meter_power |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- |----- | ------------- |
| 23 | 5 | STRING |  | 0 | serial |

## Growatt 3PH MOD TL3-X series
Three phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- | ----- | ------------- |
| 0 | 2 | UINT16 |  | 0 | status_code.run_mode |
| 1 | 2 | UINT32 | W | 0.1 | measure_power.ac |
| 3 | 2 | UINT16 | V | 0.1 | measure_voltage.pv1 |
| 5 | 2 | UINT32 | W | 0.1 | measure_power.pv1 |
| 7 | 2 | UINT16 | V | 0.1 | measure_voltage.pv2 |
| 9 | 2 | UINT32 | W | 0.1 | measure_power.pv2 |
| 35 | 2 | UINT32 | W | 0.1 | measure_power |
| 38 | 2 | UINT16 | V | 0.1 | measure_voltage.phase1 |
| 42 | 2 | UINT16 | V | 0.1 | measure_voltage.phase2 |
| 46 | 2 | UINT16 | V | 0.1 | measure_voltage.phase3 |
| 53 | 2 | UINT32 | kWh | 0.1 | meter_power.today |
| 55 | 2 | UINT32 | kWh | 0.1 | meter_power |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID |
| ------- | ------ | --------- | ---- |----- | ------------- |
| 23 | 5 | STRING |  | 0 | serial |

# DEYE
# KSTAR
