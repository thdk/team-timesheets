import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

const { BigQuery } = require('@google-cloud/bigquery');

// tslint:disable-next-line
import 'firebase-functions';

import moment from 'moment-es6';

import { parse as json2csv } from 'json2csv';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as gcs from '@google-cloud/storage';
import { IFirebaseConfig } from './interfaces';
import { exportToBigQuery, ExportToBigQueryTask } from './bigquery/export';
import { IRegistrationData } from './interfaces/IRegistrationData';

const adminConfig: IFirebaseConfig | undefined = process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG);
if (!adminConfig) {
    throw new Error("Firebase functions should have process.env.FIREBASE_CONFIG set.");
}
const bucketName = adminConfig.storageBucket;

admin.initializeApp();

// Reference report in Firestore
const db = admin.firestore();

exports.createCSV = functions.firestore
    .document('reports/{reportId}')
    .onCreate(snapshot => {
        const reportData = snapshot.data();

        if (!reportData) return new Promise(resolve => resolve());

        const { year, month, userId } = reportData;

        const reportId = snapshot.id;
        const fileName = `reports/${year}/${month}/${userId}.csv`;
        const tempFilePath = path.join(os.tmpdir(), fileName);

        const reportRef = db.collection('reports').doc(reportId)

        // Reference Storage
        // Create a root reference
        const store = new gcs.Storage();

        const storage = store.bucket(bucketName); // test

        let projectsMap: Map<string, any>;
        let tasksMap: Map<string, any>;
        let clientsMap: Map<string, any>;

        const startMoment = moment(`${year}-${month}`, 'YYYY-MM');
        const endDate = startMoment.clone().endOf("month").toDate();
        const startDate = startMoment.clone().startOf("month").toDate();

        return Promise.all([
            db.collection('projects').get().then(s => projectsMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()]))),
            db.collection('tasks').get().then(s => tasksMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()]))),
            db.collection('clients').get().then(s => clientsMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()])))
        ]).then(() => db.collection('registrations')
            .where("deleted", "==", false)
            .where("date", ">=", startDate)
            .where("date", "<=", endDate)
            .where("userId", "==", userId)
            .get()
            .then(querySnapshot => {
                const registrations: any[] = [];

                // create array of registration data
                querySnapshot.forEach(doc => {
                    const fireStoreData = doc.data() as IRegistrationData;

                    const projectData = projectsMap.get(fireStoreData.project);
                    const taskData = tasksMap.get(fireStoreData.task);
                    const clientData = clientsMap.get(fireStoreData.client);

                    const project = projectData ? projectData.name : fireStoreData.project;
                    const task = taskData ? taskData.name : fireStoreData.task;
                    const client = clientData ? clientData.name : fireStoreData.client;
                    const date = fireStoreData.date ? fireStoreData.date.toDate().getDate() : "";
                    const time = fireStoreData.time ? parseFloat(fireStoreData.time.toFixed(2)) : 0;

                    registrations.push({ ...fireStoreData, project, task, date, client, time });
                });

                return json2csv(registrations, { fields: ["date", "time", "project", "task", "client", "description"] });
            })
            .then(csv => {
                // Write the file to cloud function tmp storage
                return fs.outputFile(tempFilePath, csv);
            }, error => {
                throw new Error(error)
            })
            .then(() => {
                // Upload the file to Firebase cloud storage
                return storage.upload(tempFilePath, { destination: fileName })
            }, error => {
                throw new Error(error)
            })
            .then(_file => {
                // Update status to complete in Firestore
                // TODO? Get download url of uploaded file and add it to the Firestore report record
                return reportRef.update({ status: 'complete' })
            }, error => {
                throw new Error(error)
            }));
    });

const exportTasks: ExportToBigQueryTask[] = [
    {
        collection: "registrations",
    },
    {
        collection: "projects",
    }
]

const performExportToBigQuery = () => exportToBigQuery(exportTasks, new BigQuery({ projectId: adminConfig.projectId }), db);
exports.exportToBigQuery = functions.https.onCall(performExportToBigQuery);

exports.scheduledExportToBigQuery = functions.pubsub.schedule('every day 09:00')
    .timeZone('Europe/Brussels')
    .onRun(() => performExportToBigQuery());

// Temporary function to add timestamps to data already in database
exports.initTimestampsForRegistrations = functions.https.onCall(() => {
    const collections = ["registrations", "projects"];
    return Promise.all(collections.reduce((previousPromises, c) => {
        const collectionRef = db.collection(c);
        collectionRef.get().then(snapshot => {
            const updates: { ref: FirebaseFirestore.DocumentReference, data: any }[] = snapshot.docs.reduce((p, doc) => {
                const data = doc.data();
                let shouldUpdate = false;

                const newData = {};
                if (!data.created) {
                    Object.assign(newData, { created: data.date || admin.firestore.FieldValue.serverTimestamp() });
                    shouldUpdate = true;
                }

                if (!data.modified) {
                    Object.assign(newData, { modified: data.date || admin.firestore.FieldValue.serverTimestamp() });
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    p.push({ ref: doc.ref, data: newData });
                }

                return p;

            }, []);

            let i: number;
            let temparray: { ref: FirebaseFirestore.DocumentReference, data: any }[];
            const chunk = 500; // max 500 records in a batch

            const j = updates.length;

            const results = [];
            for (i = 0; i < j; i += chunk) {
                temparray = updates.slice(i, i + chunk);
                const batch = db.batch();
                temparray.forEach(update => {
                    batch.update(update.ref, update.data);
                });
                results.push(batch.commit());
            }

            return Promise.all(results);

        });
        return previousPromises;
    }, []));

});




