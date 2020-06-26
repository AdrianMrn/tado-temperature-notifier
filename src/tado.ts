import Axios from 'axios';
const tadoClientSecret = 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc';

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

export function getToken(): Promise<string> {
    return new Promise((resolve) => {
        Axios.post(
            `https://auth.tado.com/oauth/token?client_id=tado-web-app&grant_type=password&scope=home.user&username=${process.env.TADO_USERNAME}&password=${process.env.TADO_PASSWORD}&client_secret=${tadoClientSecret}`
        )
            .then((response) => resolve(response.data.access_token))
            .catch((error) => {
                throw new Error('Error while authenticating with Tado: ' + error);
            });
    });
}

export function getHomeId(tadoToken: string): Promise<number> {
    return new Promise((resolve) => {
        Axios.get('https://my.tado.com/api/v1/me', {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => resolve(response.data.homeId))
            .catch((error) => {
                console.log('Error while getting Tado home ID:', error.response.data);
            });
    });
}

export function getHomeZones(tadoToken: string, homeId: number): Promise<Array<HomeZone>> {
    return new Promise((resolve) => {
        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/zones`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => resolve(response.data))
            .catch((error) => {
                console.log('Error while getting Tado zones:', error.response.data);
            });
    });
}

export function getZoneDetails(
    tadoToken: string,
    homeId: number,
    zoneId: number
): Promise<ZoneDetails> {
    return new Promise((resolve) => {
        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/zones/${zoneId}/state`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => resolve(response.data))
            .catch((error) => {
                console.log('Error while getting Tado zone details:', error.response.data);
            });
    });
}

export function getExternalWeatherDetails(
    tadoToken: string,
    homeId: number
): Promise<ExternalWeatherDetails> {
    return new Promise((resolve) => {
        Axios.get(`https://my.tado.com/api/v2/homes/${homeId}/weather`, {
            headers: { Authorization: `Bearer ${tadoToken}` },
        })
            .then((response) => resolve(response.data))
            .catch((error) => {
                console.log(
                    'Error while getting external weather details from Tado:',
                    error.response.data
                );
            });
    });
}
