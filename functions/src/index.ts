import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// tslint:disable-next-line
import 'firebase-functions';

import moment from 'moment-es6';

import { parse as json2csv } from 'json2csv';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as gcs from '@google-cloud/storage';

const adminConfig = process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG);
const bucketName = adminConfig ? adminConfig.storageBucket : "";

console.log({ adminConfig });

admin.initializeApp();

// Reference report in Firestore
const db = admin.firestore();

exports.createCSV = functions.firestore
    .document('reports/{reportId}')
    .onCreate(snapshot => {
        const reportData = snapshot.data();

        if (!reportData) return new Promise(resolve => resolve());

        const { year, month, userId } = reportData;
        console.log("report data:");
        console.log({ reportData });

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

        console.log({ startDate });
        console.log({ endDate });

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
                console.log("Snapshot size: " + querySnapshot.size);
                const registrations: any[] = [];

                // create array of registration data
                querySnapshot.forEach(doc => {
                    const fireStoreData = doc.data();

                    const projectData = projectsMap.get(fireStoreData.project);
                    const taskData = tasksMap.get(fireStoreData.task);
                    const clientData = clientsMap.get(fireStoreData.client);

                    const project = projectData ? projectData.name : fireStoreData.project;
                    const task = taskData ? taskData.name : fireStoreData.task;
                    const client = clientData ? clientData.name : fireStoreData.client;
                    const date = fireStoreData.date ? fireStoreData.date.toDate().getDate() : "";
                    const time = fireStoreData.time ? fireStoreData.time.toFixed(2) : 0;

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



