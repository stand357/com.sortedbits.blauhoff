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

-   Set self consumption mode (VPP mode1)
-   Set direct charge mode (VPP mode2)
-   Set direct discharge mode (VPP mode3)
-   Charge only，no discharging (VPP mode 4)
-   Discharge only to the load, avoid charging (VPP mode 5)
-   Inverter outputs at specified power (VPP mode 6)
-   Inverter operates at the specified power (VPP mode 7)

# Modbus Register information

# BLAUHOFF

## BlauHoff SPHA

BlauHoff SPHA series of string inverters with MODBUS interface.

### Input Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID                       | Capability name          |
| ------- | ------ | --------- | ---- | ----- | ------------- | ----------------------------------- | ------------------------ |
| 36101   | 1      | UINT16    |      | -     | No            | status_code.run_mode                | Run mode                 |
| 36103   | 1      | UINT16    |      | -     | No            | status_code.sys_error_code          | Error code               |
| 36104   | 1      | UINT16    |      | -     | No            | status_code.sys_bat_error_code      | Battery error code       |
| 36108   | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.pv1                 | PV 1 voltage             |
| 36109   | 1      | UINT16    | A    | 0.1   | No            | measure_current.pv1                 | PV 1 current             |
| 36110   | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.pv2                 | PV 2 voltage             |
| 36111   | 1      | UINT16    | A    | 0.1   | No            | measure_current.pv2                 | PV 2 current             |
| 36112   | 1      | UINT16    | W    | -     | No            | measure_power.pv1                   | PV 1 power               |
| 36113   | 1      | UINT16    | W    | -     | No            | measure_power.pv2                   | PV 2 power               |
| 36117   | 2      | INT32     | W    | -     | No            | measure_power.dsp                   | DSP power                |
| 36124   | 2      | INT32     | W    | -     | No            | measure_power.eps                   | EPS power                |
| 36131   | 2      | INT32     | W    | -     | No            | measure_power.grid_output           | Grid output power        |
| 36138   | 2      | INT32     | W    | -     | No            | measure_power.battery               | Battery power            |
| 36151   | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.battery             | Battery voltage          |
| 36155   | 1      | UINT16    | %    | -     | No            | measure_percentage.bat_soc          | Battery SOC              |
| 36156   | 1      | UINT16    | %    | -     | No            | measure_percentage.bat_soh          | State of health          |
| 36161   | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.battery_high    | Battery temperature high |
| 36163   | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.battery_low     | Battery temperature low  |
| 36201   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.battery_total_charge    | undefined                |
| 36203   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.battery_total_discharge | undefined                |
| 36205   | 2      | INT32     | W    | -     | No            | measure_power.pv                    | PV power                 |
| 36207   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.total_to_grid_pv        | Total PV to grid         |
| 36209   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.total_to_grid           | Total to grid            |
| 36211   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.total_from_grid         | Total from grid          |
| 36213   | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.pv                      | Total PV                 |

### Holding Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID                       | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ----------------------------------- | --------------- |
| 60001   | 1      | UINT16    |      | -     | No            | status_code.work_mode               | Work mode       |
| 60003   | 1      | UINT16    | %    | -     | No            | measure_percentage.max_feedin_limit | undefined       |
| 60004   | 1      | INT16     | W    | -     | No            | measure_power.battery_power_ref     | undefined       |
| 60005   | 1      | INT16     | W    | -     | No            | measure_power.power_ref_inv_limit   | undefined       |
| 60007   | 1      | UINT16    |      | -     | No            | measure_xxxtimexxx.vpp_timer        | undefined       |
| 60008   | 1      | UINT16    |      | -     | No            | onoff.vpp_timer_enable              | undefined       |
| 60009   | 1      | UINT16    | %    | 0.01  | No            | measure_percentage.bat_cap_min      | undefined       |

# GROWATT

## Growatt 1PH MIC TL-X series

Single phase Growatt string inverters with MODBUS interface.

### Input Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID           | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ----------------------- | --------------- |
| 0       | 2      | UINT16    |      | -     | No            | status_code.run_mode    | Run mode        |
| 1       | 2      | UINT32    | W    | 0.1   | No            | measure_power.ac        | AC power        |
| 3       | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv1     | PV 1 voltage    |
| 5       | 2      | UINT32    | W    | 0.1   | No            | measure_power.pv1       | PV 1 power      |
| 7       | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv2     | PV 2 voltage    |
| 9       | 2      | UINT32    | W    | 0.1   | No            | measure_power.pv2       | PV 2 power      |
| 35      | 2      | UINT32    |      | 0.1   | No            | measure_power           | Power           |
| 38      | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l1 | Grid L1 voltage |
| 53      | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.today       | undefined       |
| 55      | 2      | UINT32    |      | 0.1   | No            | meter_power             | Energy          |

### Holding Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
| 23      | 5      | STRING    |      | -     | No            | serial        | Serial number   |

## Growatt 3PH MOD TL3-X series

Three phase Growatt string inverters with MODBUS interface.

### Input Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID           | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ----------------------- | --------------- |
| 0       | 2      | UINT16    |      | -     | No            | status_code.run_mode    | Run mode        |
| 1       | 2      | UINT32    | W    | 0.1   | No            | measure_power.ac        | AC power        |
| 3       | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv1     | PV 1 voltage    |
| 5       | 2      | UINT32    | W    | 0.1   | No            | measure_power.pv1       | PV 1 power      |
| 7       | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv2     | PV 2 voltage    |
| 9       | 2      | UINT32    | W    | 0.1   | No            | measure_power.pv2       | PV 2 power      |
| 35      | 2      | UINT32    |      | 0.1   | No            | measure_power           | Power           |
| 38      | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l1 | Grid L1 voltage |
| 42      | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l2 | Grid L2 voltage |
| 46      | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l3 | Grid L3 voltage |
| 53      | 2      | UINT32    | kWh  | 0.1   | No            | meter_power.today       | undefined       |
| 55      | 2      | UINT32    |      | 0.1   | No            | meter_power             | Energy          |

### Holding Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
| 23      | 5      | STRING    |      | -     | No            | serial        | Serial number   |

# DEYE

## Deye Sun \*K SG01HP3 EU AM2 Series

Deye Sun \*K SG01HP3 EU AM2 Series with modbus interface

### Input Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |

### Holding Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID                       | Capability name             |
| ------- | ------ | --------- | ---- | ----- | ------------- | ----------------------------------- | --------------------------- |
| 1       | 1      | UINT16    |      | -     | No            | status_code.modbus_address          | Modbus address              |
| 2       | 1      | UINT16    |      | -     | No            | status_code.modbus_protocol         | Modbus version              |
| 3       | 5      | STRING    |      | -     | No            | serial                              | Serial number               |
| 500     | 1      | UINT16    |      | -     | No            | status_code.run_mode                | Run mode                    |
| 514     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_battery_charge    | Daily battery charge        |
| 515     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_battery_discharge | Daily battery discharge     |
| 516     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_battery_charge    | Total battery charge        |
| 518     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_battery_discharge | Total battery discharge     |
| 520     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_from_grid         | Daily from grid             |
| 521     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_to_grid           | Daily to grid               |
| 522     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_from_grid         | Total from grid             |
| 524     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_to_grid           | Total to grid               |
| 526     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_to_load           | Daily to load               |
| 527     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_to_load           | Total to load               |
| 529     | 1      | UINT16    | kWh  | 0.1   | No            | meter_power.daily_pv                | Daily PV                    |
| 534     | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.total_pv                | Total PV                    |
| 540     | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.dc              | DC temperature              |
| 541     | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.ac              | AC temperature              |
| 586     | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.battery1        | Battery 1 temperature       |
| 587     | 1      | INT16     | V    | 0.1   | No            | measure_voltage.battery1            | Battery 1 voltage           |
| 588     | 1      | UINT16    | %    | -     | No            | measure_percentage.battery1         | undefined                   |
| 589     | 1      | UINT16    | %    | -     | No            | measure_percentage.battery2         | undefined                   |
| 590     | 1      | INT16     | W    | -     | No            | measure_power.battery1              | Battery 1 power             |
| 591     | 1      | INT16     | A    | 0.01  | No            | measure_current.battery1            | Battery 1 current           |
| 593     | 1      | INT16     | V    | 0.1   | No            | measure_voltage.battery2            | Battery 2 voltage           |
| 594     | 1      | INT16     | A    | 0.01  | No            | measure_current.battery2            | Battery 2 current           |
| 595     | 1      | INT16     | W    | -     | No            | measure_power.battery2              | Battery 2 power             |
| 596     | 1      | UINT16    | °C   | 0.1   | No            | measure_temperature.battery2        | Battery 2 temperature       |
| 598     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l1             | Grid L1 voltage             |
| 599     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l2             | Grid L2 voltage             |
| 600     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.grid_l3             | Grid L3 voltage             |
| 604     | 1      | INT16     | W    | -     | No            | measure_power.grid_int_ctl1         | Grid power int CT L1        |
| 605     | 1      | INT16     | W    | -     | No            | measure_power.grid_int_ctl2         | Grid power int CT L2        |
| 606     | 1      | INT16     | W    | -     | No            | measure_power.grid_int_ctl3         | Grid power int CT L3        |
| 607     | 1      | INT16     | W    | -     | No            | measure_power.total_active_in_power | Meter power total active in |
| 616     | 1      | INT16     | W    | -     | No            | measure_power.grid_ext_ctl1         | Grid power ext CT L1        |
| 617     | 1      | INT16     | W    | -     | No            | measure_power.grid_ext_ctl2         | Grid power ext CT L2        |
| 618     | 1      | INT16     | W    | -     | No            | measure_power.grid_ext_ctl3         | Grid power ext CT L3        |
| 625     | 1      | UINT16    | W    | -     | No            | measure_power.grid                  | Grid output power           |
| 627     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.inverter_l1         | Inverter L1 voltage         |
| 628     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.inverter_l2         | Inverter L2 voltage         |
| 629     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.inverter_l3         | Inverter L3 voltage         |
| 630     | 1      | INT16     | A    | 0.01  | No            | measure_current.inverter_l1         | Inverter L1 current         |
| 631     | 1      | INT16     | A    | 0.01  | No            | measure_current.inverter_l2         | Inverter L2 current         |
| 632     | 1      | INT16     | A    | 0.01  | No            | measure_current.inverter_l3         | Inverter L3 current         |
| 633     | 1      | INT16     | W    | -     | No            | measure_power.inverter_l1           | Inverter L1 power           |
| 634     | 1      | INT16     | W    | -     | No            | measure_power.inverter_l2           | Inverter L2 power           |
| 635     | 1      | INT16     | W    | -     | No            | measure_power.inverter_l3           | Inverter L3 power           |
| 636     | 1      | INT16     | W    | -     | No            | measure_power.inverter              | Inverter power              |
| 644     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.load_l1             | Load L1 voltage             |
| 645     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.load_l2             | Load L2 voltage             |
| 646     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.load_l3             | Load L3 voltage             |
| 650     | 1      | INT16     | W    | -     | No            | measure_power.load_l1               | Load L1 power               |
| 651     | 1      | INT16     | W    | -     | No            | measure_power.load_l2               | Load L2 power               |
| 652     | 1      | INT16     | W    | -     | No            | measure_power.load_l3               | Load L3 power               |
| 653     | 1      | INT16     | W    | -     | No            | measure_power.load                  | load power                  |
| 672     | 1      | UINT16    | W    | -     | No            | measure_power.pv1                   | PV 1 power                  |
| 673     | 1      | UINT16    | W    | -     | No            | measure_power.pv2                   | PV 2 power                  |
| 676     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.pv1                 | PV 1 voltage                |
| 677     | 1      | UINT16    | A    | 0.1   | No            | measure_current.pv1                 | PV 1 current                |
| 678     | 1      | UINT16    | V    | 0.1   | No            | measure_voltage.pv2                 | PV 2 voltage                |
| 679     | 1      | UINT16    | A    | 0.1   | No            | measure_current.pv2                 | PV 2 current                |

# AFORE

## Afore AF XK-TH Three Phase Hybrid Inverter

Afore AF XK-TH Three Phase Hybrid Inverter Series with modbus interface

### Input Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID          | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ---------------------- | --------------- |
| 507     | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.phase1 | undefined       |
| 508     | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.phase2 | undefined       |
| 509     | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.phase3 | undefined       |
| 553     | 4      | UINT32    |      | 0.1   | No            | measure_power          | Power           |
| 555     | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv1    | PV 1 voltage    |
| 557     | 2      | UINT16    | W    | 0.1   | No            | measure_power.pv1      | PV 1 power      |
| 558     | 2      | UINT16    | V    | 0.1   | No            | measure_voltage.pv2    | PV 2 voltage    |
| 560     | 2      | UINT16    | W    | 0.1   | No            | measure_power.pv2      | PV 2 power      |
| 1000    | 2      | UINT16    | kWh  | 0.1   | No            | meter_power.today      | undefined       |
| 1014    | 4      | UINT32    |      | 0.1   | No            | meter_power            | Energy          |
| 2500    | 2      | UINT16    |      | -     | No            | status_code.run_mode   | Run mode        |

### Holding Registers

| Address | Length | Data Type | Unit | Scale | Tranformation | Capability ID | Capability name |
| ------- | ------ | --------- | ---- | ----- | ------------- | ------------- | --------------- |
