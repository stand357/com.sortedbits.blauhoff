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

### Installation

Currently only the test version of the app is up-to-date for usage with both Modbus or Solarman.

1. Visit [the installation page here](https://homey.app/a/com.sortedbits.blauhoff/test/).
2. Click the big green **`Install App`** button that appears on the page.
3. If you are not logged in, into your Homey account, please log in.
4. The website will ask you, which Homey to install to, please select the correct Homey.
5. Click on the huge **`Install App`** button again.
6. A message will appear that notifies you, that the app will be installed on your Homey.

#### In Homey

After the app installed, there are a couple more steps you need to complete to add you BlauHoff device to Homey:

1. Press the **`+`** button to add a new device.
2. From the list that is shown, choose **`BlauHoff`**.
3. Choose **`BlauHoff Hybrid Inverter`** from the list.
4. Choose **`Connect`** from the popup that appears.
5. During the connection process, you need to select the brand of device you have. Either Deye or Afore, select the brand and click **`Next`**.
6. You should now choose which **model** of device you have. Select it and click **`Next`**.
7. The **`Connection Type`** screen lets you select between a Solarman or a Modbus connection. Choose what type of connection you need to your device and click **`Next`**.
8. In the next screen, you should fill out your device details:
    1. Host, the IP address of either your Modbus adapter or your Solarman dongle.
    2. Port, for Modbus this usually is **`502`**, for your Solarman dongle **`8899`**.
    3. Unit ID, this is the Modbus slave ID, normally this is **`1`**.
    4. If you have chosen to use a Solarman connection, you need to fill in the Solarman dongle serial number.
9. Click **`Connect`**.
10. If your device is succesfully found, you can select it in the next screen and click **`Continue`**.

### Auto update

If you install the test version of the app, using the [Homey Store link](https://homey.app/a/com.sortedbits.blauhoff/test/) you will receive updates automatically once they are released.

## Other supported devices

During the development of the Modbus implementation, we used Growatt inverters to test reading data from a Modbus to ethernet connected device. These devices van still be used to read some basic properties.

1. [Growatt 1PH MIC TL-X series](docs/growatt/growatt-tl.md)
2. [Growatt 3PH MOD TL3-X series](docs/growatt/growatt-tl3.md)
