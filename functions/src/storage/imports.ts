import * as functions from 'firebase-functions';
import * as path from 'path';
import * as admin from "firebase-admin";
import { getAdminConfig } from '../utils';

const adminConfig = getAdminConfig();

export const watchForFilesToImportFrom = functions.storage.bucket(adminConfig.storageBucket).object().onFinalize(async (file) => {
    const fileBucket = file.bucket; // The Storage bucket that contains the file.
    const filePath = file.name; // File path in the bucket.
    const contentType = file.contentType; // File content type.

    console.log("File uploaded:");
    console.log({ fileBucket, filePath, contentType, objectMode: true });
    // ...

    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // Only watch CSV files in imports folder
    if (!dirName.startsWith("imports/")) return false;
    if (!fileName.endsWith('.csv')) return fileName + " is not a csv file";

    const db = admin.firestore();
    return db.collection("imports").doc().set({
        collection: dirName.substr(8),
        bucket: file.bucket,
        file: file.name
    });
});