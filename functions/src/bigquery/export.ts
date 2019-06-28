import { firestore } from "firebase-admin";
import { IProjectData } from "../interfaces/IProjectData";
import { IRegistrationData } from "../interfaces/IRegistrationData";
import { BigQueryField, insertRows } from "./utils";

// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

export const convertRegistration = (firebaseChange: FirebaseFirestore.DocumentSnapshot) => {
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
        deleted: reg.deleted
    };
};

export const convertProject = (firebaseChange: FirebaseFirestore.DocumentSnapshot) => {
    const project = firebaseChange.data() as unknown as IProjectData;
    return {
        id: firebaseChange.id,
        name: project.name,
        icon: project.icon,
        createdBy: project.createdBy,
        created: project.created ? project.created.toDate().toISOString().replace('Z', '') : null,
        modified: project.modified ? project.modified.toDate().toISOString().replace('Z', '') : null,
    }
}

const projectSchema: BigQueryField[] = [
    { "name": "icon", "type": "STRING" },
    { "name": "name", "type": "STRING" },
    { "name": "created", "type": "TIMESTAMP" },
    { "name": "modified", "type": "TIMESTAMP" },
    { "name": "createdBy", "type": "STRING" },
    { "name": "id", "type": "STRING" }
];

const registrationSchema: BigQueryField[] = [
    { "name": "id", "type": "STRING" },
    { "name": "created", "type": "TIMESTAMP" },
    { "name": "deleted", "type": "BOOLEAN" },
    { "name": "date", "type": "TIMESTAMP" },
    { "name": "description", "type": "STRING" },
    { "name": "modified", "type": "TIMESTAMP" },
    { "name": "project", "type": "STRING" },
    { "name": "task", "type": "STRING" },
    { "name": "client", "type": "STRING" },
    { "name": "time", "type": "FLOAT" },
    { "name": "userId", "type": "STRING" },
];

const firestoreBigQueryMap: { [collection: string]: { convert: (change: FirebaseFirestore.DocumentSnapshot) => any, schema: BigQueryField[], dateField?: string } } = {
    "registrations": {
        convert: convertRegistration,
        schema: registrationSchema
    },
    "projects": {
        convert: convertProject,
        schema: projectSchema
    }
}

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
                changeSets.map(set => {
                    const config = firestoreBigQueryMap[set.task.collection];
                    return insertRows(bigquery,
                        Object.assign(biqQueryOptions, { tableId: set.task.collection, schema: config.schema }),
                        config.convert ? set.result.docs.map(config.convert) : set.result.docs
                    );
                })
            );
        });
};
