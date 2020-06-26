import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore({ projectId: process.env.GCP_PROJECT_ID });

export function getOldValues(): Promise<{ oldShouldOpenWindows: boolean; oldShouldCloseCurtains: boolean }> {
    return new Promise((resolve) => {
        datastore.runQuery(datastore.createQuery('state')).then(([result]) => {
            // TODO: cache in global namespace

            const { oldShouldOpenWindows, oldShouldCloseCurtains } = result[0];

            if (!oldShouldOpenWindows || !oldShouldCloseCurtains) {
                return resolve({ oldShouldOpenWindows: false, oldShouldCloseCurtains: false });
            }

            // TODO: write new values
            resolve({ oldShouldOpenWindows, oldShouldCloseCurtains });
        });
    });
}
