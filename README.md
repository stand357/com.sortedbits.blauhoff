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

