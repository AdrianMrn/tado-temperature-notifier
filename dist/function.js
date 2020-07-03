"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.boot = void 0;
require('dotenv').config();
var tado_1 = require("./tado");
var notifier_1 = require("./notifier");
var datastore_1 = require("./datastore");
console.log('cold boot');
var amountOfWarmBoots = 0;
function boot(_, res) {
    return __awaiter(this, void 0, void 0, function () {
        var tadoToken, tadoHomeId, externalWeatherDetails, tadoHomeZones, heatingZone, tadoZoneDetails, insideTemperature, outsideTemperature, weatherState, shouldOpenWindows, shouldCloseCurtains, _a, dbIsEmpty, oldShouldOpenWindows, oldShouldCloseCurtains, subject, html;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Starting up function');
                    amountOfWarmBoots++;
                    console.log('amount of consecutive warm boots:', amountOfWarmBoots);
                    return [4 /*yield*/, tado_1.getToken()];
                case 1:
                    tadoToken = _b.sent();
                    return [4 /*yield*/, tado_1.getHomeId(tadoToken)];
                case 2:
                    tadoHomeId = _b.sent();
                    return [4 /*yield*/, tado_1.getExternalWeatherDetails(tadoToken, tadoHomeId)];
                case 3:
                    externalWeatherDetails = _b.sent();
                    return [4 /*yield*/, tado_1.getHomeZones(tadoToken, tadoHomeId)];
                case 4:
                    tadoHomeZones = _b.sent();
                    heatingZone = tadoHomeZones.find(function (zone) { return zone.type === 'HEATING'; });
                    if (!heatingZone) {
                        throw new Error('Could not find a Tado heating zone');
                    }
                    return [4 /*yield*/, tado_1.getZoneDetails(tadoToken, tadoHomeId, heatingZone.id)];
                case 5:
                    tadoZoneDetails = _b.sent();
                    insideTemperature = tadoZoneDetails.sensorDataPoints.insideTemperature.celsius;
                    outsideTemperature = externalWeatherDetails.outsideTemperature.celsius;
                    weatherState = externalWeatherDetails.weatherState.value;
                    shouldOpenWindows = outsideTemperature < insideTemperature;
                    shouldCloseCurtains = weatherState === 'SUN';
                    return [4 /*yield*/, datastore_1.getOldValues()];
                case 6:
                    _a = _b.sent(), dbIsEmpty = _a.dbIsEmpty, oldShouldOpenWindows = _a.oldShouldOpenWindows, oldShouldCloseCurtains = _a.oldShouldCloseCurtains;
                    if (oldShouldOpenWindows !== shouldOpenWindows || oldShouldCloseCurtains !== shouldCloseCurtains) {
                        subject = "\n            " + (shouldOpenWindows ? 'Open' : 'Close') + " the windows,\n            " + (shouldCloseCurtains ? 'close' : 'open') + " the curtains!\n        ";
                        html = "\n            <h3>\n                If it's too hot,\n                " + (shouldOpenWindows ? 'open' : 'close') + " the windows,\n                " + (shouldCloseCurtains ? 'close' : 'open') + " the curtains!\n            </h3>\n            <p>Outside temperature: " + outsideTemperature + "</p>\n            <p>Inside temperature: " + insideTemperature + "</p>\n            <p>Current weather state: " + weatherState + "</p>\n        ";
                        notifier_1.sendMail({ subject: subject, text: html, html: html });
                    }
                    if (!(dbIsEmpty || oldShouldOpenWindows !== shouldOpenWindows || oldShouldCloseCurtains !== shouldCloseCurtains)) return [3 /*break*/, 8];
                    return [4 /*yield*/, datastore_1.writeNewValues({ shouldOpenWindows: shouldOpenWindows, shouldCloseCurtains: shouldCloseCurtains })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    res.send({
                        oldShouldOpenWindows: oldShouldOpenWindows,
                        shouldOpenWindows: shouldOpenWindows,
                        oldShouldCloseCurtains: oldShouldCloseCurtains,
                        shouldCloseCurtains: shouldCloseCurtains,
                        outsideTemperature: outsideTemperature,
                        insideTemperature: insideTemperature,
                        weatherState: weatherState
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.boot = boot;
