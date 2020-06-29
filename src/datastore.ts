import { Datastore } from '@google-cloud/datastore';
const datastore = new Datastore({ projectId: process.env.GCP_PROJECT_ID });

let cachedOldShouldOpenWindows: boolean, cachedOldShouldCloseCurtains: boolean;

export function getOldValues(): Promise<{
    dbIsEmpty: boolean;
    oldShouldOpenWindows: boolean | null;
    oldShouldCloseCurtains: boolean | null;
}> {
    console.log('running getOldValues');

    return new Promise((resolve) => {
        /* We're caching the values in the global scope. If they exist, it means we're in a hot load and we can use those values.
        If they don't exist, it means we're in a cold boot and we need to get the values from the DB. */
        if (cachedOldShouldOpenWindows !== undefined && cachedOldShouldCloseCurtains !== undefined) {
            console.log('getOldValues: using cached values');

            return resolve({
                dbIsEmpty: false,
                oldShouldOpenWindows: cachedOldShouldOpenWindows,
                oldShouldCloseCurtains: cachedOldShouldCloseCurtains,
            });
        }

        console.log('getOldValues: getting values from Datastore');
        datastore.get(datastore.key(['state', 'oldValues'])).then((result) => {
            // If no result, return `null` for both values
            if (!result || !result[0]) {
                console.log('getOldValues: no values found in Datastore');

                return resolve({ dbIsEmpty: true, oldShouldOpenWindows: null, oldShouldCloseCurtains: null });
            }

            const { oldShouldOpenWindows, oldShouldCloseCurtains } = result[0];

            if (oldShouldOpenWindows === undefined || oldShouldOpenWindows === undefined) {
                throw new Error('Error in getOldValues, could not get values from response');
            }

            cachedOldShouldOpenWindows = oldShouldOpenWindows;
            cachedOldShouldCloseCurtains = oldShouldCloseCurtains;

            resolve({ dbIsEmpty: false, oldShouldOpenWindows, oldShouldCloseCurtains });
        });
    });
}

export function writeNewValues({
    shouldOpenWindows,
    shouldCloseCurtains,
}: {
    shouldOpenWindows: boolean;
    shouldCloseCurtains: boolean;
}): Promise<void> {
    console.log('running writeNewValues');

    // Updating cached values
    cachedOldShouldOpenWindows = shouldOpenWindows;
    cachedOldShouldCloseCurtains = shouldCloseCurtains;

    return new Promise((resolve) => {
        datastore
            .upsert({
                key: datastore.key(['state', 'oldValues']),
                data: { oldShouldOpenWindows: shouldOpenWindows, oldShouldCloseCurtains: shouldCloseCurtains },
            })
            .then((response) => {
                console.log('writeNewValues received response:', response);
                resolve();
            });
    });
}
