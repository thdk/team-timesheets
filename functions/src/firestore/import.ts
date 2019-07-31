import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

import { insertRowsAsync } from '../bigquery/utils';
import { bigQuerySchemes, csvDerserializers } from '../bigquery/config';
import { loadCsvAsync } from '../storage/utils';
import { addAsync } from './utils';

// TODO: use config/env variable for dataSetId?
const dataSetId = "timesheets";

export const watchImportSessions = functions.firestore
    .document('imports/{importId}')
    .onCreate(snapshot => {
        console.log(`New import doc`);

        // Update state of the import record
        return snapshot.ref.update({ state: "Import started" }).then(() => {

            // Gather the data for the import
            const importData = snapshot.data();
            if (!importData) {
                console.log("No data found to import");
                return new Promise(resolve => resolve());
            }

            const { bucket, file, collection } = importData as { bucket: string, file: string, collection: string };
            const importId = snapshot.id;

            if (collection !== "registrations" && collection !== "projects")
                throw new Error("Can only import registrations or projects");

            const deserialiseForBigquery = (data: any) => ({ ...csvDerserializers["bigquery"][collection](data), importId });
            const deserialiseForFirestore = (data: any) => ({ ...csvDerserializers["firestore"][collection](data), importId });


            const insertDirectlyToBigquery = false;

            const deserialise = insertDirectlyToBigquery ? deserialiseForBigquery : deserialiseForFirestore;

            const insertBigQueryFunc = (items: any) => {
                return insertRowsAsync(
                    {
                        dataSetId,
                        tableId: collection,
                        tableIdPrefix: "",
                        schemes: bigQuerySchemes
                    },
                    items
                )
            };

            const insertFirestoreFunc = (items: any) => {
                const db = admin.firestore();
                return addAsync(db, db.collection(collection), items);
            };

            const insertFunc = insertDirectlyToBigquery ? insertBigQueryFunc : insertFirestoreFunc;

            // Load data from CSV in cloud storage and insert into bigquery
            return loadCsvAsync<any>(bucket, file, deserialise)
                .then(insertFunc)
                .then(() => {
                    return snapshot.ref.update({ state: "Import finished" })
                });
        });
    });