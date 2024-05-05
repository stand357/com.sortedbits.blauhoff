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

