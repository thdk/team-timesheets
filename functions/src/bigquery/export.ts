import { firestore } from "firebase-admin";

// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

export type BigQueryConfig = { dataSetId: string; tableId: string; tableIdPrefix: string };
export type ExportToBigQueryTask<T = any> = {
    collection: string;
    convertToBigQuery?: (data: firestore.DocumentData) => T;
    dateField?: string;
}

export const exportToBigQuery = (tasks: ExportToBigQueryTask[], bigquery: typeof BigQuery, db: FirebaseFirestore.Firestore) => {
    // TODO: use config/env variable for dataSetId and tableId/table prefix?
    const dataSetId = "testdata";

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
            // Set up filter to get all modified records since last export timestamp
            const filterByDate = (collection: firestore.CollectionReference, dateField: string) => {
                if (lastExportTimestamp) return collection.where(dateField, ">", lastExportTimestamp);
                return collection;
            };

            // Run the filter for the collection of each export task
            return Promise.all(tasks.map(task => filterByDate(db.collection(task.collection), task.dateField || "modified")
                .get().then(result => ({ task, result }))));
        })
        // Stream all changes into bigquery
        .then(changeSets => Promise.all(
            changeSets.map(set => insertRows(bigquery,
                Object.assign(biqQueryOptions, { tableId: set.task.collection }),
                set.task.convertToBigQuery ? set.result.docs.map(set.task.convertToBigQuery) : set.result.docs
            )))
        );
};

function insertRows<T>(bigquery: typeof BigQuery, options: BigQueryConfig, rows: ReadonlyArray<T>) {
    const { dataSetId, tableId, tableIdPrefix = "" } = options;

    if (!rows.length) return new Promise(resolve => resolve());

    return bigquery
        .dataset(dataSetId)
        .table(`${tableIdPrefix}${tableId}`)
        .insert(rows).then(() => {
            console.log(`Inserted ${rows.length} rows`);
        }, (error: { errors: string[], name: string, response: any, message: string }) => {
            console.log(error.name);
            console.log(error.message);
            error.errors && error.errors.forEach(e => {
                console.log(`${Object.keys(e).join(", ")}`);
            });

            console.log(error.response);
        });
}