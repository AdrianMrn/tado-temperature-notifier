require('dotenv').config();
import { getToken, getHomeId, getHomeZones, getZoneDetails, getExternalWeatherDetails } from './tado';
import { sendMail } from './notifier';
import { getOldValues } from './datastore';

export async function boot(_: any, res: any) {
    // TODO: write console.log statements pretty much everywhere to keep track of function
    const tadoToken = await getToken();
    const tadoHomeId = await getHomeId(tadoToken);

    // TODO: use Promise.all() (?) instead of awaits where we don't need to wait for another request

    const externalWeatherDetails = await getExternalWeatherDetails(tadoToken, tadoHomeId);

    const tadoHomeZones = await getHomeZones(tadoToken, tadoHomeId);
    const heatingZone = tadoHomeZones.find((zone) => zone.type === 'HEATING');

    if (!heatingZone) {
        throw new Error('Could not find a Tado heating zone');
    }

    const tadoZoneDetails = await getZoneDetails(tadoToken, tadoHomeId, heatingZone.id);

    const insideTemperature = tadoZoneDetails.sensorDataPoints.insideTemperature.celsius;
    const outsideTemperature = externalWeatherDetails.outsideTemperature.celsius;
    const isSunny =
        externalWeatherDetails.weatherState.value === 'SUN' && externalWeatherDetails.solarIntensity.percentage > 50; // TODO: experiment with this value;

    const shouldOpenWindows = outsideTemperature < insideTemperature;
    const shouldCloseCurtains = isSunny;

    const { oldShouldOpenWindows, oldShouldCloseCurtains } = await getOldValues();

    if (oldShouldOpenWindows !== shouldOpenWindows) {
        sendMail({
            subject: `${shouldOpenWindows ? 'Open' : 'Close'} the windows!`,
            text: `
                Outside temperature: ${outsideTemperature}\n
                Inside temperature: ${insideTemperature}
            `,
        });
    }

    if (oldShouldCloseCurtains !== shouldCloseCurtains) {
        sendMail({
            subject: `${shouldCloseCurtains ? 'Close' : 'Open'} the curtains!`,
            text: `
                Outside temperature: ${outsideTemperature}\n
                Inside temperature: ${insideTemperature}
            `,
        });
    }

    // TODO: send JSON response with old & new values & temperatures
    res.send(200);
}
