import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import moment from 'moment-es6';

import { parse as json2csv } from 'json2csv';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as gcs from '@google-cloud/storage';

admin.initializeApp();

// Reference report in Firestore
const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

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

        const storage = store.bucket('timesheets-ffc4b.appspot.com');

        let projectsMap: Map<string, any>;
        let tasksMap: Map<string, any>;

        const startMonent = moment(`${year}-${month}`, 'YYYY-MM');
        const endDate = startMonent.clone().endOf("month").toDate();
        const startDate = startMonent.clone().startOf("month").toDate();

        return Promise.all([
            db.collection('projects').get().then(s => projectsMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()]))),
            db.collection('tasks').get().then(s => tasksMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()])))
        ]).then(() => db.collection('registrations')
            .where("deleted", "==", false)
            .where("date", ">", startDate)
            .where("date", "<=", endDate)
            .where("userId", "==", userId)
            .get()
            .then(querySnapshot => {
                const registrations: any[] = [];

                // create array of registration data
                querySnapshot.forEach(doc => {
                    const fireStoreData = doc.data();
                    const projectData = projectsMap.get(fireStoreData.project);
                    const taskData = tasksMap.get(fireStoreData.task);
                    const project = projectData ? projectData.name : fireStoreData.project;
                    const task = taskData ? taskData.name : fireStoreData.task;
                    const date = fireStoreData.date.toDate().getDate();
                    registrations.push({ ...fireStoreData, project, task, date });
                });

                return json2csv(registrations, {fields: ["date", "time", "project", "description", "task"]});
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
    })


