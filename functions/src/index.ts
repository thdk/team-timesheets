import * as functions from 'firebase-functions'
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

exports.requestReport = functions.https.onRequest((req, res) => {
    // ...
    const { year, user: userId, month } = req.query;
    admin.firestore().collection('reports').add(
        {
            status: 'waiting',
            userId,
            year,
            month
        }
    ).then(r =>
        res.status(200).send(r.id)
        , error => {
            res.status(500).end()
        })
});

exports.createCSV = functions.firestore
    .document('reports/{reportId}')
    .onCreate(snapshot => {

        // Step 1. Set main variables

        const reportData = snapshot.data();
        const { year, month, userId } = reportData;

        const reportId = snapshot.id;
        const fileName = `reports/${reportId}.csv`;
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
                /// Step 3. Creates CSV file from with orders collection
                const orders = []

                // create array of order data
                querySnapshot.forEach(doc => {
                    const fireStoreData = doc.data();
                    const projectData = projectsMap.get(fireStoreData.project);
                    const taskData = tasksMap.get(fireStoreData.task);
                    const project = projectData ? projectData.name : fireStoreData.project;
                    const task = taskData ? taskData.name : fireStoreData.task;

                    // todo use optiosn of jsonTOcsv to filter unwanted fields from csv
                    // instead of deleting each field below
                    delete fireStoreData.deleted;
                    delete fireStoreData.userId;
                    orders.push({ ...fireStoreData, project, task });
                });

                return json2csv(orders);
            })
            .then(csv => {
                // Step 4. Write the file to cloud function tmp storage
                return fs.outputFile(tempFilePath, csv);
            }, error => {
                throw new Error(error)
            })
            .then(() => {
                // Step 5. Upload the file to Firebase cloud storage
                return storage.upload(tempFilePath, { destination: fileName })
            }, error => {
                throw new Error(error)
            })
            .then(file => {
                // Step 6. Update status to complete in Firestore

                return reportRef.update({ status: 'complete' })
            }, error => {
                throw new Error(error)
            }));
    })


