import { convertRegistration } from "../../../common/lib/serialization/deserializer";

// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

export const exportToBigQuery = (bigquery: typeof BigQuery, db: FirebaseFirestore.Firestore) => {
    // TODO: use config for dataSetId and tableId
    const datasetId = "testdata";
    const tableId = "registrations_test";


    return db.collection("exports").orderBy("date", "desc").limit(1).get()
        .then(data => data.size ? data.docChanges()[0].doc.data().date.toDate() : undefined)
        .then(lastExportTimestamp => {
            const filter = collection => {
                if (lastExportTimestamp) return collection.where("date", ">", lastExportTimestamp);
                return collection;
            };

            return filter(db.collection("registrations"))
                .where("deleted", "==", false)
                .get()
        })
        .then(newRegistrations => {
            const rows = newRegistrations.docs.map(doc => {
                const reg = convertRegistration(doc.data() as unknown as any);
                return {
                    id: doc.id,
                    description: reg.description,
                    time: reg.time,
                    date: reg.date ? reg.date.toISOString().replace('Z', '') : null,
                    task: reg.task,
                    project: reg.project,
                    client: reg.client,
                    userId: reg.userId
                };
            });

            return bigquery
                .dataset(datasetId)
                .table(tableId)
                .insert(rows).then(() => {
                    console.log(`Inserted ${rows.length} rows`);
                }, (error: { errors: string[], name: string, response: any, message: string }) => {
                    console.log(error.name);
                    console.log(error.message);
                    error.errors.forEach(e => {
                        console.log(`${Object.keys(e).join(", ")}`);
                        console.log(e);
                    });

                    console.log(error.response);
                });
        })

    // Inserts data into a table

};