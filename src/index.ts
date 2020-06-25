require('dotenv').config();
import {
    getToken,
    getHomeId,
    getHomeDetails,
    getHomeZones,
    getZoneDetails,
    getExternalWeatherDetails,
} from './tado';

async function boot() {
    const tadoToken = await getToken();
    const tadoHomeId = await getHomeId(tadoToken);
    const tadoHomeDetails = await getHomeDetails(tadoToken, tadoHomeId);
    const tadoHomeZones = await getHomeZones(tadoToken, tadoHomeId);

    const heatingZone = tadoHomeZones.find((zone) => zone.type === 'HEATING');

    if (!heatingZone) {
        throw new Error('Could not find a Tado heating zone');
    }

    const tadoZoneDetails = await getZoneDetails(tadoToken, tadoHomeId, heatingZone.id);
    const externalWeatherDetails = await getExternalWeatherDetails(tadoToken, tadoHomeId);

    const insideTemperature = tadoZoneDetails.sensorDataPoints.insideTemperature.celsius;
    const outsideTemperature = externalWeatherDetails.outsideTemperature.celsius;
    const isSunny =
        externalWeatherDetails.weatherState.value === 'SUN' &&
        externalWeatherDetails.solarIntensity.percentage > 50; // TODO: experiment with this value;

    const shouldOpenWindows = outsideTemperature < insideTemperature;
    const shouldCloseCurtains = isSunny;

    console.log({ outsideTemperature, insideTemperature, shouldOpenWindows, shouldCloseCurtains });
}

boot();
