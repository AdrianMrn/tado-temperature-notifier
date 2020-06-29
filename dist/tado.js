"use strict";
exports.__esModule = true;
exports.getExternalWeatherDetails = exports.getZoneDetails = exports.getHomeZones = exports.getHomeId = exports.getToken = void 0;
var axios_1 = require("axios");
var tadoClientSecret = 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc';
// There's no point in caching the API token, because it expires every 10 minutes
function getToken() {
    console.log('running getToken');
    return new Promise(function (resolve) {
        axios_1["default"].post("https://auth.tado.com/oauth/token?client_id=tado-web-app&grant_type=password&scope=home.user&username=" + process.env.TADO_USERNAME + "&password=" + process.env.TADO_PASSWORD + "&client_secret=" + tadoClientSecret)
            .then(function (response) {
            console.log('getToken received response:', response);
            return resolve(response.data.access_token);
        })["catch"](function (error) {
            throw new Error('getToken error: ' + error.response.data);
        });
    });
}
exports.getToken = getToken;
var cachedHomeIds = {};
function getHomeId(tadoToken) {
    console.log('running getHomeId');
    return new Promise(function (resolve) {
        if (cachedHomeIds[tadoToken]) {
            return resolve(cachedHomeIds[tadoToken]);
        }
        axios_1["default"].get('https://my.tado.com/api/v1/me', {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) {
            console.log('getHomeId received response:', response);
            cachedHomeIds[tadoToken] = response.data.homeId;
            return resolve(response.data.homeId);
        })["catch"](function (error) {
            throw new Error('getHomeId error: ' + error.response.data);
        });
    });
}
exports.getHomeId = getHomeId;
var cachedHomeZones = {};
function getHomeZones(tadoToken, homeId) {
    console.log('running getHomeZones');
    return new Promise(function (resolve) {
        if (cachedHomeZones[homeId]) {
            return resolve(cachedHomeZones[homeId]);
        }
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/zones", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) {
            console.log('getHomeZones received response:', response);
            cachedHomeZones[homeId] = response.data;
            return resolve(response.data);
        })["catch"](function (error) {
            throw new Error('getHomeZones error: ' + error.response.data);
        });
    });
}
exports.getHomeZones = getHomeZones;
// Not caching this data because it needs to be up to date
function getZoneDetails(tadoToken, homeId, zoneId) {
    console.log('running getZoneDetails');
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/zones/" + zoneId + "/state", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) {
            console.log('getZoneDetails received response:', response);
            return resolve(response.data);
        })["catch"](function (error) {
            throw new Error('getZoneDetails error: ' + error.response.data);
        });
    });
}
exports.getZoneDetails = getZoneDetails;
// Not caching this data because it needs to be up to date
function getExternalWeatherDetails(tadoToken, homeId) {
    console.log('running getExternalWeatherDetails');
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/weather", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) {
            console.log('getExternalWeatherDetails received response:', response);
            return resolve(response.data);
        })["catch"](function (error) {
            throw new Error('getExternalWeatherDetails error: ' + error.response.data);
        });
    });
}
exports.getExternalWeatherDetails = getExternalWeatherDetails;
