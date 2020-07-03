require('dotenv').config();
import { getToken, getHomeId, getHomeZones, getZoneDetails, getExternalWeatherDetails } from './tado';
import { sendMail } from './notifier';
import { getOldValues, writeNewValues } from './datastore';

console.log('cold boot');
let amountOfWarmBoots = 0;

export async function boot(_: any, res: any) {
    console.log('Starting up function');

    amountOfWarmBoots++;
    console.log('amount of consecutive warm boots:', amountOfWarmBoots);

    const tadoToken = await getToken();
    const tadoHomeId = await getHomeId(tadoToken);

    // TODO: use Promise.all() (?) instead of awaits where we don't need to wait for another request (getting the inside temperature doesn't need to wait for the outside temperature)
    const externalWeatherDetails = await getExternalWeatherDetails(tadoToken, tadoHomeId);

    const tadoHomeZones = await getHomeZones(tadoToken, tadoHomeId);
    const heatingZone = tadoHomeZones.find((zone) => zone.type === 'HEATING');

    if (!heatingZone) {
        throw new Error('Could not find a Tado heating zone');
    }

    const tadoZoneDetails = await getZoneDetails(tadoToken, tadoHomeId, heatingZone.id);

    const insideTemperature = tadoZoneDetails.sensorDataPoints.insideTemperature.celsius;

    const outsideTemperature = externalWeatherDetails.outsideTemperature.celsius;
    const weatherState = externalWeatherDetails.weatherState.value;

    const shouldOpenWindows = outsideTemperature < insideTemperature;
    const shouldCloseCurtains = weatherState === 'SUN';

    const { dbIsEmpty, oldShouldOpenWindows, oldShouldCloseCurtains } = await getOldValues();

    if (oldShouldOpenWindows !== shouldOpenWindows || oldShouldCloseCurtains !== shouldCloseCurtains) {
        const subject = `
            ${shouldOpenWindows ? 'Open' : 'Close'} the windows,
            ${shouldCloseCurtains ? 'close' : 'open'} the curtains!
        `;

        const html = `
            <h3>
                If it's too hot,
                ${shouldOpenWindows ? 'open' : 'close'} the windows,
                ${shouldCloseCurtains ? 'close' : 'open'} the curtains!
            </h3>
            <p>Outside temperature: ${outsideTemperature}</p>
            <p>Inside temperature: ${insideTemperature}</p>
            <p>Current weather state: ${weatherState}</p>
        `;

        sendMail({ subject, text: html, html });
    }

    if (dbIsEmpty || oldShouldOpenWindows !== shouldOpenWindows || oldShouldCloseCurtains !== shouldCloseCurtains) {
        await writeNewValues({ shouldOpenWindows, shouldCloseCurtains });
    }

    res.send({
        oldShouldOpenWindows,
        shouldOpenWindows,
        oldShouldCloseCurtains,
        shouldCloseCurtains,
        outsideTemperature,
        insideTemperature,
        weatherState,
    });
}
