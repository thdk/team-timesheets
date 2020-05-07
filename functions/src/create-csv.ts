import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

import moment from 'moment-es6';
import 'moment-timezone';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as gcs from '@google-cloud/storage';
import { getAdminConfig } from './utils';
import { IRegistrationData } from './interfaces/IRegistrationData';
import { parse as json2csv } from 'json2csv';



export const createCSV = functions.firestore
.document('reports/{reportId}')
.onCreate(snapshot => {
        const db = admin.firestore();

        const adminConfig = getAdminConfig();
        const bucketName = adminConfig.storageBucket;

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

        // TODO: use timezone saved on user account
        const startMoment = moment(`${year}-${month}`, 'YYYY-MM').tz('Europe/Brussels');
        const endDate = startMoment.clone().endOf("month").toDate();
        const startDate = startMoment.clone().startOf("month").toDate();

        // Plus (+) character and comma characters give problems in CSV file
        // Replace '+' and ',' with space for CSV export
        const stripInvalidCSVChars = (text: string) => {
            return text
                .replace(new RegExp(",", 'g'), " ")
                .replace(new RegExp("\\+", 'g'), " ");
        };

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
                    const description = fireStoreData.description ? stripInvalidCSVChars(fireStoreData.description) : "";

                    registrations.push({ ...fireStoreData, project, task, date, client, time, description });
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