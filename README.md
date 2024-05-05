# BlauHoff

Adds support for BlauHoff Inverter and Battery devices.

![Workflow](https://github.com/sorted-bits/com.sortedbits.blauhoff/actions/workflows/node.js.yml/badge.svg)

## Supported devices

The following devices are supported through both a Modbus connection or using a Solarman Wifi dongle.

1. [Deye Sun \*K SG01HP3 EU AM2 Series](docs/deye/deye-sun-xk-sg01hp3-eu-am2.md)
2. [Afore AF XK-TH Three Phase Hybrid Inverter](docs/afore/af-xk-th-three-phase-hybrid.md)

### Solarman

A lot of inverters already come with some sort of Wifi-dongle. For the devices mentioned above, we made it possible to directly connect Homey to the Solarman Wifi dongle itself, using the internal IP address of the dongle.

This allows us to read and write to the inverter, without using a cloud connection, which makes it more stable, but also allows for data to be read more often.

### Modbus

When you want to use the Modbus connection, you need a device like the [Waveshare RS232/RS485 to POE ETH](<https://www.waveshare.com/wiki/RS232_RS485_TO_POE_ETH_(B)>). We tested the linked the device and had a nice experience with it. The linked version supports Power over Ethernet which allows you to just run a single ethernet wire to it.

## Other supported devices

During the development of the Modbus implementation, we used Growatt inverters to test reading data from a Modbus to ethernet connected device. These devices van still be used to read some basic properties.

1. [Growatt 1PH MIC TL-X series](docs/growatt/growatt-tl.md)
2. [Growatt 3PH MOD TL3-X series](docs/growatt/growatt-tl3.md)
