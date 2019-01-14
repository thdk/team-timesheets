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

                    // placeholder for client. Adds empty column in exported csv.
                    const client = "";
                    registrations.push({ ...fireStoreData, project, task, date, client });
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

exports.getChart = functions.https.onCall((data, context) => {
    // Message text passed from the client.
    const year = data.year;

    // Checking attribute.
    // if (!(typeof year === 'number') || number.length === 0) {
    //     // Throwing an HttpsError so that the client gets the error details.
    //     throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
    //         'one arguments "text" containing the message text to add.');
    // }

    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    // const name = context.auth.token.name || null;
    // const picture = context.auth.token.picture || null;
    // const email = context.auth.token.email || null;

    let projectsMap: Map<string, any>;
    let tasksMap: Map<string, any>;

    const startMonent = moment(`${year}`, 'YYYY');
    const endDate = startMonent.clone().endOf("year").toDate();
    const startDate = startMonent.clone().startOf("year").toDate();

    return Promise.all([
        db.collection('projects').get()
            .then(
                s => projectsMap = new Map(s.docs.map((d): [string, any] =>
                    [d.id, { ...d.data(), totalTime: 0 }])
                )
            ),
        db.collection('tasks').get().then(s => tasksMap = new Map(s.docs.map((d): [string, any] => [d.id, d.data()])))
    ]).then(() => db.collection('registrations')
        .where("deleted", "==", false)
        .where("date", ">", startDate)
        .where("date", "<=", endDate)
        .where("userId", "==", uid)
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

                delete fireStoreData.deleted;
                delete fireStoreData.userId;
                registrations.push({ ...fireStoreData, project, task, date });
            });

            registrations.forEach(r => {
                const project = projectsMap.get(r.project);
                if (project) {
                    project.totalTime = project.totalTime + r.time;
                }
            });

            return Array.from(projectsMap.values());
        }))
});


