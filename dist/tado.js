"use strict";
exports.__esModule = true;
exports.getExternalWeatherDetails = exports.getZoneDetails = exports.getHomeZones = exports.getHomeDetails = exports.getHomeId = exports.getToken = void 0;
var axios_1 = require("axios");
var tadoClientSecret = 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc';
function getToken() {
    return new Promise(function (resolve) {
        axios_1["default"].post("https://auth.tado.com/oauth/token?client_id=tado-web-app&grant_type=password&scope=home.user&username=" + process.env.TADO_USERNAME + "&password=" + process.env.TADO_PASSWORD + "&client_secret=" + tadoClientSecret)
            .then(function (response) { return resolve(response.data.access_token); })["catch"](function (error) {
            throw new Error('Error while authenticating with Tado: ' + error);
        });
    });
}
exports.getToken = getToken;
function getHomeId(tadoToken) {
    return new Promise(function (resolve) {
        axios_1["default"].get('https://my.tado.com/api/v1/me', {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) { return resolve(response.data.homeId); })["catch"](function (error) {
            console.log('Error while getting Tado home ID:', error.response.data);
        });
    });
}
exports.getHomeId = getHomeId;
function getHomeDetails(tadoToken, homeId) {
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId, {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) { return resolve(response.data); })["catch"](function (error) {
            console.log('Error while getting Tado home details:', error.response.data);
        });
    });
}
exports.getHomeDetails = getHomeDetails;
function getHomeZones(tadoToken, homeId) {
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/zones", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) { return resolve(response.data); })["catch"](function (error) {
            console.log('Error while getting Tado zones:', error.response.data);
        });
    });
}
exports.getHomeZones = getHomeZones;
function getZoneDetails(tadoToken, homeId, zoneId) {
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/zones/" + zoneId + "/state", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) { return resolve(response.data); })["catch"](function (error) {
            console.log('Error while getting Tado zone details:', error.response.data);
        });
    });
}
exports.getZoneDetails = getZoneDetails;
function getExternalWeatherDetails(tadoToken, homeId) {
    return new Promise(function (resolve) {
        axios_1["default"].get("https://my.tado.com/api/v2/homes/" + homeId + "/weather", {
            headers: { Authorization: "Bearer " + tadoToken }
        })
            .then(function (response) { return resolve(response.data); })["catch"](function (error) {
            console.log('Error while getting external weather details from Tado:', error.response.data);
        });
    });
}
exports.getExternalWeatherDetails = getExternalWeatherDetails;
