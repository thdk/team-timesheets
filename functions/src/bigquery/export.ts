import { firestore } from "firebase-admin";
import { firestoreBigQueryMap, bigQuerySchemes } from "./config";

// Imports the Google Cloud client library
import { BigQuery } from '@google-cloud/bigquery';
import { insertRowsAsync } from "./utils";

export type ExportToBigQueryTask = {
    collection: string;
}

export const exportToBigQuery = (tasks: ExportToBigQueryTask[], bigquery: BigQuery, db: FirebaseFirestore.Firestore) => {
    // TODO: use config/env variable for dataSetId and tableId/table prefix?
    const dataSetId = "timesheets";

    const biqQueryOptions = { dataSetId, tableIdPrefix: "" };

    return db.collection("exports").orderBy("timestamp", "desc").limit(1).get()
        .then(data => {
            // insert new export record
            return db.collection("exports").doc().set({ timestamp: firestore.FieldValue.serverTimestamp() })
                .then(() => {
                    // Resolve with last export timestamp if any
                    return data.size ? data.docChanges()[0].doc.data().timestamp.toDate() : undefined;
                });
        })
        .then(lastExportTimestamp => {
            console.log(`Last exported: ${lastExportTimestamp}`);

            // Set up filter to get all modified records since last export timestamp
            const filterByDate = (collection: firestore.CollectionReference, dateField: string) => {
                if (lastExportTimestamp) return collection.where(dateField, ">", lastExportTimestamp);
                return collection;
            };

            // Run the filter for the collection of each export task
            return Promise.all(tasks.map(task => filterByDate(db.collection(task.collection), firestoreBigQueryMap[task.collection].dateField || "modified")
                .get().then(result => ({ task, result }))));
        })
        // Stream all changes into bigquery
        .then(changeSets => {
            console.log(`Number of collections with changes: ${changeSets.length}`);
            return Promise.all(
                changeSets.map(set => {
                    const config = firestoreBigQueryMap[set.task.collection];
                    return insertRowsAsync(
                        Object.assign(biqQueryOptions, { tableId: set.task.collection, schemes: bigQuerySchemes }),
                        config.convert ? set.result.docs.map(config.convert) : set.result.docs,
                        bigquery
                    );
                })
            );
        });
};
