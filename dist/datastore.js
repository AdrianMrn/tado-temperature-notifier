"use strict";
exports.__esModule = true;
exports.getOldValues = void 0;
var datastore_1 = require("@google-cloud/datastore");
var datastore = new datastore_1.Datastore({ projectId: process.env.GCP_PROJECT_ID });
function getOldValues() {
    return new Promise(function (resolve) {
        datastore.runQuery(datastore.createQuery('state')).then(function (_a) {
            // TODO: cache in global namespace
            var result = _a[0];
            var _b = result[0], oldShouldOpenWindows = _b.oldShouldOpenWindows, oldShouldCloseCurtains = _b.oldShouldCloseCurtains;
            if (!oldShouldOpenWindows || !oldShouldCloseCurtains) {
                return resolve({ oldShouldOpenWindows: false, oldShouldCloseCurtains: false });
            }
            resolve({ oldShouldOpenWindows: oldShouldOpenWindows, oldShouldCloseCurtains: oldShouldCloseCurtains });
        });
    });
}
exports.getOldValues = getOldValues;
