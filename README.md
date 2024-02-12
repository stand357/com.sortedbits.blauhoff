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
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | --------------- |
| 36101| 1| UINT16| | 1| status_code.run_mode| Run mode |
| 36103| 1| UINT16| | 1| status_code.sys_error_code| Error code |
| 36104| 1| UINT16| | 1| status_code.sys_bat_error_code| Battery error code |
| 36108| 1| UINT16| V| 0.1| measure_voltage.pv1| PV1 voltage |
| 36109| 1| UINT16| A| 0.1| measure_current.pv1| PV1 current |
| 36110| 1| UINT16| V| 0.1| measure_voltage.pv2| PV2 voltage |
| 36111| 1| UINT16| A| 0.1| measure_current.pv2| PV2 current |
| 36112| 1| UINT16| W| 1| measure_power.pv1| PV1 power |
| 36113| 1| UINT16| W| 1| measure_power.pv2| PV2 power |
| 36117| 2| INT32| W| 1| measure_power.dsp| DSP power |
| 36124| 2| INT32| W| 1| measure_power.eps| EPS power |
| 36131| 2| INT32| W| 1| measure_power.grid_output| Grid output power |
| 36138| 2| INT32| W| 1| measure_power.battery| Battery power |
| 36151| 1| UINT16| V| 0.1| measure_voltage.battery| Battery voltage |
| 36155| 1| UINT16| %| 1| measure_percentage.bat_soc| State of charge |
| 36156| 1| UINT16| %| 1| measure_percentage.bat_soh| State of health |
| 36161| 1| UINT16| °C| 0.1| measure_temperature.battery_high| Battery temperature high |
| 36163| 1| UINT16| °C| 0.1| measure_temperature.battery_low| Battery temperature low |
| 36201| 2| UINT32| kWh| 0.1| meter_power.battery_total_charge| Battery total charge |
| 36203| 2| UINT32| kWh| 0.1| meter_power.battery_total_discharge| Battery total discharge |
| 36205| 2| INT32| W| 1| measure_power.pv| PV power |
| 36207| 2| UINT32| kWh| 0.1| meter_power.total_to_grid_pv| PV total to grid |
| 36209| 2| UINT32| kWh| 0.1| meter_power.total_to_grid| Total to grid |
| 36211| 2| UINT32| kWh| 0.1| meter_power.total_from_grid| Total from grid |
| 36213| 2| UINT32| kWh| 0.1| meter_power.pv| PV total |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | ------------- | --------------- |
| 60001| 1| UINT16| | 0.1| status_code.work_mode| Work mode |

# GROWATT
## Growatt 1PH MIC TL-X series
Single phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | --------------- |
| 0| 2| UINT16| | 0| status_code.run_mode| Run mode |
| 1| 2| UINT32| W| 0.1| measure_power.ac| AC power |
| 3| 2| UINT16| V| 0.1| measure_voltage.pv1| PV1 voltage |
| 5| 2| UINT32| W| 0.1| measure_power.pv1| PV1 power |
| 7| 2| UINT16| V| 0.1| measure_voltage.pv2| PV2 voltage |
| 9| 2| UINT32| W| 0.1| measure_power.pv2| PV2 power |
| 35| 2| UINT32| W| 0.1| measure_power| Power |
| 38| 2| UINT16| V| 0.1| measure_voltage.phase1| Phase 1 voltage |
| 53| 2| UINT32| kWh| 0.1| meter_power.today| Energy today |
| 55| 2| UINT32| kWh| 0.1| meter_power| Energy |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | ------------- | --------------- |
| 23| 5| STRING| | 0| serial| Serial number |

## Growatt 3PH MOD TL3-X series
Three phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | --------------- |
| 0| 2| UINT16| | 0| status_code.run_mode| Run mode |
| 1| 2| UINT32| W| 0.1| measure_power.ac| AC power |
| 3| 2| UINT16| V| 0.1| measure_voltage.pv1| PV1 voltage |
| 5| 2| UINT32| W| 0.1| measure_power.pv1| PV1 power |
| 7| 2| UINT16| V| 0.1| measure_voltage.pv2| PV2 voltage |
| 9| 2| UINT32| W| 0.1| measure_power.pv2| PV2 power |
| 35| 2| UINT32| W| 0.1| measure_power| Power |
| 38| 2| UINT16| V| 0.1| measure_voltage.phase1| Phase 1 voltage |
| 42| 2| UINT16| V| 0.1| measure_voltage.phase2| Phase 2 voltage |
| 46| 2| UINT16| V| 0.1| measure_voltage.phase3| Phase 3 voltage |
| 53| 2| UINT32| kWh| 0.1| meter_power.today| Energy today |
| 55| 2| UINT32| kWh| 0.1| meter_power| Energy |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | ------------- | --------------- |
| 23| 5| STRING| | 0| serial| Serial number |

# DEYE
# KSTAR
## Kstar Hybrid Inverter
Kstar Hybrid inverters with MODBUS interface

### Input Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | --------------- |
| 3000| 2| UINT16| V| 0.1| measure_voltage.pv1| PV1 voltage |
| 3001| 2| UINT16| V| 0.1| measure_voltage.pv2| PV2 voltage |
| 3012| 2| INT16| A| 0.01| measure_current.pv1| PV1 current |
| 3013| 2| INT16| A| 0.01| measure_current.pv2| PV2 current |
| 3024| 2| INT16| W| 1| measure_power.pv1| PV1 power |
| 3025| 2| INT16| W| 1| measure_power.pv2| PV2 power |
| 3036| 2| UINT16| kWh| 0.1| meter_power.today| Energy today |
| 3041| 4| UINT32| kWh| 0.1| meter_power| Energy |
| 3046| 2| UINT16| | 0| status_code.run_mode| Run mode |
| 3066| 2| UINT16| %| 0.1| measure_percentage.bat_soc| State of charge |
| 3067| 2| UINT16| °C| 0.1| measure_temperature.battery_high| Battery temperature high |
| 3075| 2| UINT16| %| 0.1| measure_percentage.bat_soh| State of health |
| 3114| 4| UINT32| kWh| 0.1| meter_power.total_from_grid| Total from grid |
| 3121| 4| UINT32| kWh| 0.1| meter_power.total_to_grid| Total to grid |
| 3292| 4| UINT32| kWh| 0.1| meter_power.battery_total_discharge| Battery total discharge |
| 3299| 4| UINT32| kWh| 0.1| meter_power.battery_total_charge| Battery total charge |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | ------------- | --------------- |

