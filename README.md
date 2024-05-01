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

# GROWATT
## Growatt 1PH MIC TL-X series
Single phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
| 0| 1| UINT8| | -| No| status_code.run_mode| Run mode |
| 1| 2| UINT32| W| 0.1| No| measure_power.ac| AC power |
| 3| 2| UINT16| V| 0.1| No| measure_voltage.pv1| PV 1 voltage |
| 5| 2| UINT32| W| 0.1| No| measure_power.pv1| PV 1 power |
| 7| 2| UINT16| V| 0.1| No| measure_voltage.pv2| PV 2 voltage |
| 9| 2| UINT32| W| 0.1| No| measure_power.pv2| PV 2 power |
| 35| 2| UINT32| | 0.1| No| measure_power| Power |
| 38| 2| UINT16| V| 0.1| No| measure_voltage.grid_l1| Grid L1 voltage |
| 53| 2| UINT32| kWh| 0.1| No| meter_power.today| undefined |
| 55| 2| UINT32| | 0.1| No| meter_power| Energy |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- |
| 23| 5| STRING| | -| No| serial| Serial number |

## Growatt 3PH MOD TL3-X series
Three phase Growatt string inverters with MODBUS interface.

### Input Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
| 0| 1| UINT8| | -| No| status_code.run_mode| Run mode |
| 1| 2| UINT32| W| 0.1| No| measure_power.ac| AC power |
| 3| 2| UINT16| V| 0.1| No| measure_voltage.pv1| PV 1 voltage |
| 5| 2| UINT32| W| 0.1| No| measure_power.pv1| PV 1 power |
| 7| 2| UINT16| V| 0.1| No| measure_voltage.pv2| PV 2 voltage |
| 9| 2| UINT32| W| 0.1| No| measure_power.pv2| PV 2 power |
| 35| 2| UINT32| | 0.1| No| measure_power| Power |
| 38| 2| UINT16| V| 0.1| No| measure_voltage.grid_l1| Grid L1 voltage |
| 42| 2| UINT16| V| 0.1| No| measure_voltage.grid_l2| Grid L2 voltage |
| 46| 2| UINT16| V| 0.1| No| measure_voltage.grid_l3| Grid L3 voltage |
| 53| 2| UINT32| kWh| 0.1| No| meter_power.today| undefined |
| 55| 2| UINT32| | 0.1| No| meter_power| Energy |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- |
| 23| 5| STRING| | -| No| serial| Serial number |

### Supported flow actions

#### Set max solar power
Set max solar power to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |

#### Set solar selling
Set solar selling to [[enabled]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| enabled| Solar selling| - |

#### Write value to register
Write [[value]] to [[registerType]] register [[register]]
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Value| - |
| registerType| The register type where to write to| - |
| register| Register| - |

#### Set energy pattern
Set energy pattern to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Energy pattern| - |

#### Set grid peak shaving on
Set grid peak shaving on with [[value]] power.
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |

#### Set grid peak shaving off
Set grid peak shaving off.
| Name | Argument | Description |
| ------------- | ------------- | --------------- |

# DEYE
## Deye Sun *K SG01HP3 EU AM2 Series
Deye Sun *K SG01HP3 EU AM2 Series with modbus interface


### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- |
| 1| 1| UINT16| | -| No| status_code.modbus_address| Modbus address |
| 2| 1| UINT16| | -| No| status_code.modbus_protocol| Modbus version |
| 3| 5| STRING| | -| No| serial| Serial number |
| 104| 1| UINT16| | 10| No| status_code.zero_export_power| undefined |
| 141| 1| UINT16| | -| Yes| status_text.energie_management_model| undefined |
| 142| 1| UINT16| | -| Yes| status_text.work_mode| Work mode |
| 143| 1| UINT16| | 10| No| status_code.max_sell_power| Max selling power |
| 145| 1| UINT16| | -| Yes| status_text.sell_solar| Sell solar |
| 146| 1| UINT16| | -| Yes| status_text.time_of_use| Grid peak shaving |
| 148| 1| UINT16| | -| No| status_code.grid_tou_time1| undefined |
| 148| 1| UINT16| | -| No| timeslot.time| undefined |
| 149| 1| UINT16| | -| No| status_code.grid_tou_time2| undefined |
| 149| 1| UINT16| | -| No| timeslot.time| undefined |
| 150| 1| UINT16| | -| No| status_code.grid_tou_time3| undefined |
| 150| 1| UINT16| | -| No| timeslot.time| undefined |
| 151| 1| UINT16| | -| No| status_code.grid_tou_time4| undefined |
| 151| 1| UINT16| | -| No| timeslot.time| undefined |
| 152| 1| UINT16| | -| No| status_code.grid_tou_time5| undefined |
| 152| 1| UINT16| | -| No| timeslot.time| undefined |
| 153| 1| UINT16| | -| No| status_code.grid_tou_time6| undefined |
| 153| 1| UINT16| | -| No| timeslot.time| undefined |
| 154| 1| UINT16| | 10| No| status_code.grid_tou_power1| undefined |
| 154| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 155| 1| UINT16| | 10| No| status_code.grid_tou_power2| undefined |
| 155| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 156| 1| UINT16| | 10| No| status_code.grid_tou_power3| undefined |
| 156| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 157| 1| UINT16| | 10| No| status_code.grid_tou_power4| undefined |
| 157| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 158| 1| UINT16| | 10| No| status_code.grid_tou_power5| undefined |
| 158| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 159| 1| UINT16| | 10| No| status_code.grid_tou_power6| undefined |
| 159| 1| UINT16| | 10| No| timeslot.powerlimit| undefined |
| 166| 1| UINT16| | -| No| status_code.grid_tou_capacity1| undefined |
| 166| 1| UINT16| | -| No| timeslot.battery| undefined |
| 167| 1| UINT16| | -| No| status_code.grid_tou_capacity2| undefined |
| 167| 1| UINT16| | -| No| timeslot.battery| undefined |
| 168| 1| UINT16| | -| No| status_code.grid_tou_capacity3| undefined |
| 168| 1| UINT16| | -| No| timeslot.battery| undefined |
| 169| 1| UINT16| | -| No| status_code.grid_tou_capacity4| undefined |
| 169| 1| UINT16| | -| No| timeslot.battery| undefined |
| 170| 1| UINT16| | -| No| status_code.grid_tou_capacity5| undefined |
| 170| 1| UINT16| | -| No| timeslot.battery| undefined |
| 171| 1| UINT16| | -| No| status_code.grid_tou_capacity6| undefined |
| 171| 1| UINT16| | -| No| timeslot.battery| undefined |
| 172| 1| UINT16| | -| No| timeslot.charging| undefined |
| 173| 1| UINT16| | -| No| timeslot.charging| undefined |
| 174| 1| UINT16| | -| No| timeslot.charging| undefined |
| 175| 1| UINT16| | -| No| timeslot.charging| undefined |
| 176| 1| UINT16| | -| No| timeslot.charging| undefined |
| 177| 1| UINT16| | -| No| timeslot.charging| undefined |
| 178| 1| UINT16| | -| Yes| status_text.grid_peak_shaving| Grid peak shaving |
| 191| 1| UINT16| | 10| No| status_code.grid_peak_shaving_power| undefined |
| 340| 1| UINT16| | 10| No| status_code.max_solar_power| undefined |
| 500| 1| UINT16| | -| Yes| status_text.run_mode| Run mode |
| 514| 1| UINT16| kWh| 0.1| No| meter_power.daily_battery_charge| Daily battery charge |
| 515| 1| UINT16| kWh| 0.1| No| meter_power.daily_battery_discharge| Daily battery discharge |
| 516| 2| UINT16| kWh| 0.1| No| meter_power.total_battery_charge| Total battery charge |
| 518| 2| UINT16| kWh| 0.1| No| meter_power.total_battery_discharge| Total battery discharge |
| 520| 1| UINT16| kWh| 0.1| No| meter_power.daily_from_grid| Daily from grid |
| 521| 1| UINT16| kWh| 0.1| No| meter_power.daily_to_grid| Daily to grid |
| 522| 2| UINT16| kWh| 0.1| No| meter_power.total_from_grid| Total from grid |
| 524| 2| UINT16| kWh| 0.1| No| meter_power.total_to_grid| Total to grid |
| 526| 1| UINT16| kWh| 0.1| No| meter_power.daily_to_load| Daily to load |
| 527| 2| UINT16| kWh| 0.1| No| meter_power.total_to_load| Total to load |
| 529| 1| UINT16| kWh| 0.1| No| meter_power.daily_pv| Daily PV |
| 534| 2| UINT16| kWh| 0.1| No| meter_power.total_pv| Total PV |
| 540| 1| UINT16| °C| 0.01| No| measure_temperature.dc| DC temperature |
| 541| 1| UINT16| °C| 0.01| No| measure_temperature.ac| AC temperature |
| 586| 1| UINT16| °C| 0.01| No| measure_temperature.battery1| Battery 1 temperature |
| 587| 1| INT16| V| 0.1| No| measure_voltage.battery1| Battery 1 voltage |
| 588| 1| UINT16| %| -| No| measure_percentage.battery1| undefined |
| 590| 1| INT16| W| 10| No| measure_power.battery1| Battery 1 power |
| 591| 1| INT16| A| 0.01| No| measure_current.battery1| Battery 1 current |
| 598| 1| UINT16| V| 0.1| No| measure_voltage.grid_l1| Grid L1 voltage |
| 599| 1| UINT16| V| 0.1| No| measure_voltage.grid_l2| Grid L2 voltage |
| 600| 1| UINT16| V| 0.1| No| measure_voltage.grid_l3| Grid L3 voltage |
| 625| 1| UINT16| W| -| No| measure_power.grid| Grid output power |
| 636| 1| INT16| W| -| No| measure_power.inverter| Inverter power |
| 643| 1| UINT16| W| -| No| measure_power.ups| undefined |
| 653| 1| INT16| W| -| No| measure_power.load| load power |
| 672| 1| UINT16| W| 10| No| measure_power.pv1| PV 1 power |
| 673| 1| UINT16| W| 10| No| measure_power.pv2| PV 2 power |

### Supported flow actions

#### Set max solar power
Set max solar power to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |

#### Set solar selling
Set solar selling to [[enabled]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| enabled| Solar selling| - |

#### Set max sell power
Set max sell power to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |

#### Write value to register
Write [[value]] to [[registerType]] register [[register]]
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Value| - |
| registerType| The register type where to write to| - |
| register| Register| - |

#### Set energy pattern
Set energy pattern to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Energy pattern| - |

#### Set grid peak shaving on
Set grid peak shaving on with [[value]] power.
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |

#### Set grid peak shaving off
Set grid peak shaving off.
| Name | Argument | Description |
| ------------- | ------------- | --------------- |

#### Set work mode and zero export power
Set workmode to [[workmode]] and Zero Export Power to [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Watts| - |
| workmode| Workmode| - |

#### Turn time of use on/off
Set time of use to [[enabled]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| enabled| Time of use| - |

#### Turn time of use on/off for this day
Set time of use to [[enabled]] for [[day]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| enabled| Time of use| - |
| day| Day| - |

#### Set time of use parameters for timeslot
For timeslot [[timeslot]] set the start time to [[time]]. Set grid charge to [[gridcharge]] and generator charge to [[generatorcharge]]. Power limit is [[powerlimit]] and minimum battery charge is [[batterycharge]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| timeslot| Timeslot| - |
| time| Time| - |
| gridcharge| Grid charging| - |
| generatorcharge| Generator charging| - |
| powerlimit| Power limit| - |
| batterycharge| Minimum battery charge| - |

# AFORE
## Afore AF XK-TH Three Phase Hybrid Inverter
Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface

### Input Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
| 0| 6| STRING| | -| No| status_text.inverter_name| Inverter name |
| 11| 4| STRING| | -| No| status_text.hard_name| Hard name |
| 535| 2| INT32| W| -| No| measure_power.grid_active_power| Grid active power |
| 547| 2| INT32| W| -| No| measure_power.grid_total_load| Grid total load |
| 2000| 1| UINT16| | -| Yes| status_text.battery_state| Battery state |
| 2002| 2| UINT16| %| -| No| measure_percentage.bat_soc| Battery SOC |
| 2007| 2| INT32| W| -| No| measure_power.battery| Battery power |
| 2011| 2| UINT32| kWh| 0.1| No| meter_power.total_battery_charge| Total battery charge |
| 2013| 2| UINT32| kWh| 0.1| No| meter_power.total_battery_discharge| Total battery discharge |
| 2500| 1| UINT16| | -| No| status_code.running_state| undefined |

### Holding Registers
| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- |----- | -------------- | ------------- | --------------- |
| 206| 2| UINT32| | -| Yes| status_text.ac_timing_charge| AC timing charge |
| 206| 2| UINT32| | -| Yes| status_text.timing_charge| Timing charge |
| 206| 2| UINT32| | -| Yes| status_text.timing_discharge| Timing discharge |
| 2500| 1| UINT16| | -| No| status_code.run_mode| Run mode |
| 2500| 1| UINT16| | -| Yes| status_text.ems_mode| EMS mode |
| 2501| 1| UINT16| | -| Yes| status_text.charge_command| Charge command |
| 2502| 2| INT32| W| -| No| measure_power.charge_instructions| Charge command power |

### Supported flow actions

#### Write value to register
Write [[value]] to [[registerType]] register [[register]]
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| value| Value| - |
| registerType| The register type where to write to| - |
| register| Register| - |

#### Set charge command with power
Set EMS mode to Charge Command with the command [[charge_command]] using [[value]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| charge_command| Charge command| Select the charge command to set. |
| value| Watts| - |

#### Set EMS mode
Set EMS mode to [[mode]].
| Name | Argument | Description |
| ------------- | ------------- | --------------- |
| mode| EMS mode| - |

