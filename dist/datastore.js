"use strict";
exports.__esModule = true;
exports.writeNewValues = exports.getOldValues = void 0;
var datastore_1 = require("@google-cloud/datastore");
var datastore = new datastore_1.Datastore({ projectId: process.env.GCP_PROJECT_ID });
var cachedOldShouldOpenWindows, cachedOldShouldCloseCurtains;
function getOldValues() {
    console.log('running getOldValues');
    return new Promise(function (resolve) {
        /* We're caching the values in the global scope. If they exist, it means we're in a hot load and we can use those values.
        If they don't exist, it means we're in a cold boot and we need to get the values from the DB. */
        if (cachedOldShouldOpenWindows !== undefined && cachedOldShouldCloseCurtains !== undefined) {
            console.log('getOldValues: using cached values');
            return resolve({
                dbIsEmpty: false,
                oldShouldOpenWindows: cachedOldShouldOpenWindows,
                oldShouldCloseCurtains: cachedOldShouldCloseCurtains
            });
        }
        console.log('getOldValues: getting values from Datastore');
        datastore.get(datastore.key(['state', 'oldValues'])).then(function (result) {
            // If no result, return `null` for both values
            if (!result || !result[0]) {
                console.log('getOldValues: no values found in Datastore');
                return resolve({ dbIsEmpty: true, oldShouldOpenWindows: null, oldShouldCloseCurtains: null });
            }
            var _a = result[0], oldShouldOpenWindows = _a.oldShouldOpenWindows, oldShouldCloseCurtains = _a.oldShouldCloseCurtains;
            if (oldShouldOpenWindows === undefined || oldShouldOpenWindows === undefined) {
                throw new Error('Error in getOldValues, could not get values from response');
            }
            cachedOldShouldOpenWindows = oldShouldOpenWindows;
            cachedOldShouldCloseCurtains = oldShouldCloseCurtains;
            resolve({ dbIsEmpty: false, oldShouldOpenWindows: oldShouldOpenWindows, oldShouldCloseCurtains: oldShouldCloseCurtains });
        });
    });
}
exports.getOldValues = getOldValues;
function writeNewValues(_a) {
    var shouldOpenWindows = _a.shouldOpenWindows, shouldCloseCurtains = _a.shouldCloseCurtains;
    console.log('running writeNewValues');
    // Updating cached values
    cachedOldShouldOpenWindows = shouldOpenWindows;
    cachedOldShouldCloseCurtains = shouldCloseCurtains;
    return new Promise(function (resolve) {
        datastore
            .upsert({
            key: datastore.key(['state', 'oldValues']),
            data: { oldShouldOpenWindows: shouldOpenWindows, oldShouldCloseCurtains: shouldCloseCurtains }
        })
            .then(function (response) {
            console.log('writeNewValues received response:', response);
            resolve();
        });
    });
}
exports.writeNewValues = writeNewValues;
