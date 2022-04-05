import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

import { BigQuery } from '@google-cloud/bigquery';

import { exportToBigQuery, ExportToBigQueryTask } from './bigquery/export';
import { initTimestamps, initNamesInsensitive, changeProjectOfRegistrations, projectsByName, projectsAll, changeDivisionId } from './tools/firestore';
import { watchForFilesToImportFrom } from './storage/imports';
import { watchImportSessions } from './firestore/import';
import { getAdminConfig } from './utils';
import { parse as json2csv } from 'json2csv';
import { db } from './firebase';

const adminConfig = getAdminConfig();

const performChangeProjectOfRegistrations = (from: string, to: string, userId?: string) => changeProjectOfRegistrations(db, { from, to, userId });
exports.changeProjectOfRegistrations = functions.https.onCall(data => performChangeProjectOfRegistrations(data.from, data.to, data.userId));

exports.changeProjectOfRegistrationsRequest = functions.https.onRequest((req, res) => {
    return performChangeProjectOfRegistrations(req.query.from, req.query.to)
        .then(result => {
            res.send(result);
        });
});

exports.setDivisionId = functions.https.onCall((data) => {
    return changeDivisionId(db, {
        collection: data.collection,
        to: data.to,
    });
});

exports.projectsByName = functions.https.onRequest((req, res) => {
    return projectsByName(db, decodeURI(req.query.name))
        .then(result => {
            res.send(result);
        })
});

exports.projects = functions.https.onRequest((req, res) => {
    return projectsAll(db).then(result => {
        if (req.query.format && req.query.format === "csv") {
            res.send(json2csv(result, { quote: "" }));
        }
        res.send(result);
    })
});

const exportTasks: ExportToBigQueryTask[] = [
    {
        collection: "registrations",
    },
    {
        collection: "projects",
    },
    {
        collection: "users",
    },
    {
        collection: "tasks",
    },
    {
        collection: "clients",
    },
    {
        collection: "division-users",
    },
];

const performExportToBigQuery = () => exportToBigQuery(exportTasks, new BigQuery({ projectId: adminConfig.projectId }), db);
exports.exportToBigQuery = functions.https.onCall(performExportToBigQuery);

const performExportCollectionToBigQuery = (data) => exportToBigQuery(
    [
        {
            collection: data.collection,
        },
    ],
    new BigQuery({ projectId: adminConfig.projectId }),
    db,
    false,
);
exports.performExportCollectionToBigQuery = functions.https.onCall(performExportCollectionToBigQuery);

exports.scheduledExportToBigQuery = functions.pubsub.schedule('every day 00:00')
    .timeZone('Europe/Brussels')
    .onRun(() => performExportToBigQuery());

// Temporary function to add timestamps to data already in database
exports.initTimestampsForRegistrations = functions.https.onCall(() => initTimestamps(db));

// Temporary function to add name_insensitive to data already in database
exports.initNamesInsensitive = functions.https.onCall(() => initNamesInsensitive(db));

exports.watchForFilesToImportFrom = watchForFilesToImportFrom;
exports.watchImportSessions = watchImportSessions;

export * from "./create-csv";

export * from "./firestore/division";

export * from "./oauth";
