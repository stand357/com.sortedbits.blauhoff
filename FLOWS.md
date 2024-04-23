# Toevoegen van een nieuwe kaart

## Flow creëren

Pas eerst de file `driver.flow.compose.json` aan, met de kaart die je wilt maken. Hieronder een actie flow, welke onder `actions` gezet moet worden in dat bestand

```
        {
            "id": "set_max_solar_power",
            "title": {
                "en": "Set max solar power"
            },
            "titleFormatted": {
                "en": "Set max solar power to [[value]]"
            },
            "args": [
                {
                    "type": "number",
                    "name": "value",
                    "title": { "en": "Watts" },
                    "placeholder": { "en": "watts" }
                }
            ]
        }
```

Er zijn een paar belangrijke dingen waar je op moet letten.

-   `id` moet uniek zijn voor elke kaart
-   `titleFormatted` bevat een argument, in dit geval genaamd `value`.
-   `value` moet ook terugkomen in het kopje `args`, lees [dit](https://apps.developer.homey.app/the-basics/flow#title-for-flow-card-with-arguments) voor meer informatie.

## Kaart registreren

In het bestand `drivers/blauhoff-modbus/driver.ts` moet de **actie**kaart eerst geregistreerd worden. Dit doe je door in de methode `registerActionCards` een `notitie toe te voegen.

```
this.homey.flow.getActionCard('set_max_solar_power').registerRunListener(async (args) => {
    await args.device.callAction('set_max_solar_power', args);
});
```

Deze notitie zorgt er voor dat de driver doorheeft dat deze kaart bestaat en registreert en zogenaamde `listener` welke luistert naar wanneer deze kaart wordt gestart.
