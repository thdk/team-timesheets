import { firestore } from "firebase-admin";
import { IProjectData } from "../interfaces/IProjectData";
import { IRegistrationData } from "../interfaces/IRegistrationData";

// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

export const convertRegistration = (firebaseChange) => {
    const reg = firebaseChange.data() as unknown as IRegistrationData;
    return {
        id: firebaseChange.id,
        description: reg.description,
        time: reg.time,
        date: reg.date ? reg.date.toDate().toISOString().replace('Z', '') : null,
        task: reg.task,
        project: reg.project,
        client: reg.client,
        userId: reg.userId,
        created: reg.created ? reg.created.toDate().toISOString().replace('Z', '') : null,
        modified: reg.modified ? reg.modified.toDate().toISOString().replace('Z', '') : null,
    };
};

export const convertProject = (firebaseChange) => {
    const project = firebaseChange.data() as unknown as IProjectData;
    return {
        name: project.name,
        icon: project.icon,
        createdBy: project.createdBy,
        created: project.created ? project.created.toDate().toISOString().replace('Z', '') : null,
        modified: project.modified ? project.modified.toDate().toISOString().replace('Z', '') : null,
    }
}

const firestoreBigQueryMap: { [collection: string]: { convert: (change: FirebaseFirestore.DocumentData) => any, schema: string, dateField?: string } } = {
    "registrations": {
        convert: convertRegistration,
        schema: "id:string, created: timestamp, date: timestamp, deleted:boolean, description, modified:timestamp, project, task, client, time:float, userId"
    },
    "projects": {
        convert: convertProject,
        schema: "icon, name, created:timestamp, modified: timestamp, createdBy"
    }
}

export type BigQueryConfig = { dataSetId: string; tableId: string; tableIdPrefix: string };
export type ExportToBigQueryTask = {
    collection: string;
}

export const exportToBigQuery = (tasks: ExportToBigQueryTask[], bigquery: typeof BigQuery, db: FirebaseFirestore.Firestore) => {
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
                changeSets.map(set => insertRows(bigquery,
                    Object.assign(biqQueryOptions, { tableId: set.task.collection }),
                    firestoreBigQueryMap[set.task.collection].convert ? set.result.docs.map(firestoreBigQueryMap[set.task.collection].convert) : set.result.docs
                ))
            );
        });
};

function insertRows<T>(bigquery: typeof BigQuery, options: BigQueryConfig, rows: ReadonlyArray<T>) {
    console.log(`Inserting ${rows.length} rows`);
    const { dataSetId, tableId, tableIdPrefix = "" } = options;

    const insertOptions = {
        schema: firestoreBigQueryMap[tableId].schema,
        location: 'US'
    };

    if (!rows.length) return new Promise(resolve => resolve());

    // TODO: create dataset only once since insertRows can be called multiple times simultaneously!
    return bigquery
        .dataset(dataSetId)
        .get({ autoCreate: true })
        .then(([dataset]) => {
            console.log("dataset created");
            return dataset.table(`${tableIdPrefix}${tableId}`)
                .get({ autoCreate: true, ...insertOptions })
                .then(([table]) => table.insert(rows)
                    .then(() => {
                        console.log(`Inserted ${rows.length} rows`);
                        return `Inserted ${rows.length} rows`;
                    }, (error: { errors: string[], name: string, response: any, message: string }) => {
                        console.log(error.name);
                        console.log(error.message);
                        error.errors && error.errors.forEach(e => {
                            console.log(`${Object.keys(e).join(", ")}`);
                        });

                        console.log(error.response);
                    }, (e) => {
                        console.log(e);
                        console.log("Table could not be created");
                    }))
        }, (e) => {
            console.log(e);
            console.log("Dataset could not be created");
        });


}