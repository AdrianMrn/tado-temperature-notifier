import Axios from 'axios';
const tadoClientSecret = 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc';

// Currently not used; API endpoint: https://my.tado.com/api/v2/homes/${homeId}
type HomeDetails = {
    id: number;
    name: string;
    dateTimeZone: string;
    dateCreated: string;
    temperatureUnit: string;
    partner: any;
    simpleSmartScheduleEnabled: boolean;
    awayRadiusInMeters: number;
    installationCompleted: boolean;
    skills: Array<any>;
    christmasModeEnabled: boolean;
    showAutoAssistReminders: boolean;
    contactDetails: {
        name: string;
        email: string;
        phone: string;
    };
    address: {
        addressLine1: string;
        addressLine2: string;
        zipCode: string;
        city: string;
        state: null;
        country: string;
    };
    geolocation: { latitude: number; longitude: number };
    consentGrantSkippable: boolean;
};

type HomeZone = {
    id: number;
    name: string;
    type: 'HEATING' | 'HOT_WATER';
    dateCreated: string;
    deviceTypes: [string];
    devices: [[Object]];
    reportAvailable: boolean;
    supportsDazzle: boolean;
    dazzleEnabled: boolean;
    dazzleMode: { supported: boolean; enabled: boolean };
    openWindowDetection: { supported: boolean; enabled: boolean; timeoutInSeconds: number };
};

type ZoneDetails = {
    tadoMode: 'HOME' | string;
    geolocationOverride: boolean;
    geolocationOverrideDisableTime: null;
    preparation: null;
    setting: {
        type: 'HEATING';
        power: 'OFF' | 'ON';
        temperature: null | { celsius: number; fahrenheit: number };
    };
    overlayType: 'MANUAL';
    overlay: {
        type: 'MANUAL';
        setting: {
            type: 'HEATING';
            power: 'OFF' | 'ON';
            temperature: null | { celsius: number; fahrenheit: number };
        };
        termination: {
            type: 'MANUAL';
            typeSkillBasedApp: 'MANUAL';
            projectedExpiry: null;
        };
    };
    openWindow: null;
    nextScheduleChange: null;
    nextTimeBlock: { start: string };
    link: { state: 'ONLINE' };
    activityDataPoints: {
        heatingPower: {
            type: 'PERCENTAGE';
            percentage: number;
            timestamp: string;
        };
    };
    sensorDataPoints: {
        insideTemperature: {
            celsius: number;
            fahrenheit: number;
            timestamp: string;
            type: 'TEMPERATURE';
            precision: {
                celsius: number;
                fahrenheit: number;
            };
        };
        humidity: {
            type: 'PERCENTAGE';
            percentage: number;
            timestamp: string;
        };
    };
};

type ExternalWeatherDetails = {
    solarIntensity: {
        type: 'PERCENTAGE';
        percentage: number;
        timestamp: string;
    };
    outsideTemperature: {
        celsius: number;
        fahrenheit: number;
        timestamp: string;
        type: 'TEMPERATURE';
        precision: { celsius: number; fahrenheit: number };
    };
    weatherState: {
        type: 'WEATHER_STATE';
        value: 'SUN' | 'CLOUDY_PARTLY' | string;
        timestamp: string;
    };
};

// There's no point in caching the API token, because it expires every 10 minutes
export function getToken(): Promise<string> {
    console.log('running getToken');

    return new Promise((resolve) => {
        Axios.post(
            `https://auth.tado.com/oauth/token?client_id=tado-web-app&grant_type=password&scope=home.user&username=${process.env.TADO_USERNAME}&password=${process.env.TADO_PASSWORD}&client_secret=${tadoClientSecret}`
        )
            .then((response) => {
                console.log('getToken received response:', response);
                return resolve(response.data.access_token);
            })
            .catch((error) => {
                throw new Error('getToken error: ' + error.response.data);
            });
    });
}

let cachedHomeIds: { [tadoToken: string]: number } = {};
export function getHomeId(tadoToken: string): Promise<number> {
    console.log('running getHomeId');

    return new Promise((resolve) => {
        if (cachedHomeIds[tadoToken]) {
            return resolve(cachedHomeIds[tadoToken]);
        }

        Axios.get('https://my.tado.com/api/v1/me', {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => {
                console.log('getHomeId received response:', response);

                cachedHomeIds[tadoToken] = response.data.homeId;
                return resolve(response.data.homeId);
            })
            .catch((error) => {
                throw new Error('getHomeId error: ' + error.response.data);
            });
    });
}

let cachedHomeZones: { [homeId: number]: Array<HomeZone> } = {};
export function getHomeZones(tadoToken: string, homeId: number): Promise<Array<HomeZone>> {
    console.log('running getHomeZones');

    return new Promise((resolve) => {
        if (cachedHomeZones[homeId]) {
            return resolve(cachedHomeZones[homeId]);
        }

        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/zones`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => {
                console.log('getHomeZones received response:', response);

                cachedHomeZones[homeId] = response.data;
                return resolve(response.data);
            })
            .catch((error) => {
                throw new Error('getHomeZones error: ' + error.response.data);
            });
    });
}

// Not caching this data because it needs to be up to date
export function getZoneDetails(tadoToken: string, homeId: number, zoneId: number): Promise<ZoneDetails> {
    console.log('running getZoneDetails');

    return new Promise((resolve) => {
        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/zones/${zoneId}/state`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => {
                console.log('getZoneDetails received response:', response);

                return resolve(response.data);
            })
            .catch((error) => {
                throw new Error('getZoneDetails error: ' + error.response.data);
            });
    });
}

// Not caching this data because it needs to be up to date
export function getExternalWeatherDetails(tadoToken: string, homeId: number): Promise<ExternalWeatherDetails> {
    console.log('running getExternalWeatherDetails');

    return new Promise((resolve) => {
        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/weather`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => {
                console.log('getExternalWeatherDetails received response:', response);
                return resolve(response.data);
            })
            .catch((error) => {
                throw new Error('getExternalWeatherDetails error: ' + error.response.data);
            });
    });
}
