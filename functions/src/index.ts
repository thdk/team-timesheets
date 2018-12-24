import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import { parse } from 'json2csv';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as gcs from '@google-cloud/storage';

admin.initializeApp();

exports.requestReport = functions.https.onRequest((req, res) => {
    // ...
    // const {year, user, month} = req.query;
    admin.firestore().collection('reports').add({ status: 'waiting' }).then(r =>
        res.status(200).send(r.id)
        , error => {
            res.status(500).end()
        })
});

exports.createCSV = functions.firestore
    .document('reports/{reportId}')
    .onCreate(event => {

        // Step 1. Set main variables

        const reportId = event.id;
        const fileName = `reports/${reportId}.csv`;
        const tempFilePath = path.join(os.tmpdir(), fileName);

        // Reference report in Firestore
        const db = admin.firestore();
        db.settings({ timestampsInSnapshots: true });
        const reportRef = db.collection('reports').doc(reportId)

        // Reference Storage
        // Create a root reference
        const store = new gcs.Storage();
        
        const storage = store.bucket('timesheets-ffc4b.appspot.com');

        // Step 2. Query collection
        return db.collection('registrations')
            .get()
            .then(querySnapshot => {

                /// Step 3. Creates CSV file from with orders collection
                const orders = []

                // create array of order data
                querySnapshot.forEach(doc => {
                    orders.push(doc.data())
                });
                return parse({ data: orders });
            }, error => {
                throw new Error(error)
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
            });

    })


