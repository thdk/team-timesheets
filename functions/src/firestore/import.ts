import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

import { insertRowsAsync } from '../bigquery/utils';
import { bigQuerySchemes, csvDerserializers } from '../bigquery/config';
import { loadCsvAsync } from '../storage/utils';
import { addAsync } from './utils';

// TODO: use config/env variable for dataSetId?
const dataSetId = "timesheets";

export const watchImportSessions = functions.firestore
    .document('imports/{importId}')
    .onCreate(snapshot => {
        console.log(`New import doc`);

        // Update state of the import record
        return snapshot.ref.update({ state: "Import started" }).then(() => {

            // Gather the data for the import
            const importData = snapshot.data();
            if (!importData) {
                console.log("No data found to import");
                return new Promise(resolve => resolve());
            }

            const { bucket, file, collection } = importData as { bucket: string, file: string, collection: string };
            const importId = snapshot.id;

            if (collection !== "registrations" && collection !== "projects")
                throw new Error("Can only import registrations or projects");

            const deserialiseForBigquery = (data: any) => ({ ...csvDerserializers["bigquery"][collection](data), importId });
            const deserialiseForFirestore = (data: any) => ({ ...csvDerserializers["firestore"][collection](data), importId });


            const insertDirectlyToBigquery = false;

            const deserialise = insertDirectlyToBigquery ? deserialiseForBigquery : deserialiseForFirestore;

            const filterFnAsync =
                collection === "projects"
                    ? (items: any[], db: FirebaseFirestore.Firestore, ) => {
                        const collectionRef = db.collection(collection);
                        return collectionRef.get().then(itemsSnapshot => {
                            return items.reduce<any[]>((p, c) => {
                                if (itemsSnapshot.docs.some(d => d.data().name === c.name)) {
                                    console.log(`Skipped existing project: ${c.name}`);
                                    return p;
                                }
                                p.push(c);
                                return p;
                            }, [] as any[]);
                        });
                    } :
                    (items: any[]) => {
                        return new Promise<any[]>(resolve => resolve(items));
                    };

            const fixForeignKeysFnAsync =
                collection === "registrations"
                    ? (items: any[], db: FirebaseFirestore.Firestore) => {
                        const projectsCollectionRef = db.collection("projects");
                        const clientsCollectionRef = db.collection("clients");
                        const usersCollectionRef = db.collection("users");
                        const tasksCollectionRef = db.collection("tasks");

                        return Promise.all([projectsCollectionRef.get(), clientsCollectionRef.get(), usersCollectionRef.get(), tasksCollectionRef.get()])
                            .then(([projectSnapshot, clientSnapshot, userSnapshot, taskSnapshot]) => {
                                const projects = projectSnapshot.docs.map(d => ({ name: d.data().name, id: d.id }));
                                const clients = clientSnapshot.docs.map(d => ({ name: d.data().name, id: d.id }));
                                const users = userSnapshot.docs.map(d => ({ name: d.data().name, id: d.id }));
                                const tasks = taskSnapshot.docs.map(d => ({ name: d.data().name, id: d.id }));

                                return Promise.all(items.reduce((p, c) => {
                                    // Get project id, create new project if needed
                                    const project = projects.find(projectDoc => (projectDoc.name || "").toLowerCase() === (c.project || "").toLowerCase());
                                    if (!project && c.project) {
                                        const docRef = projectsCollectionRef.doc();
                                        const projectData = {
                                            name: c.project,
                                            name_insensitive: ((c.project || "") as string).toUpperCase(),
                                            isArchived: true,
                                            importId
                                        };

                                        console.log("Inserting new project...");
                                        console.log({ projectData });

                                        projects.push({ name: c.project, id: docRef.id });

                                        c.project = docRef.id;
                                        p.push(docRef.set(projectData));
                                    } else {
                                        if (project) c.project = project.id;
                                        else delete c.project;
                                    }

                                    // Get user id, create new user if needed
                                    const user = users.find(userDoc => (userDoc.name || "").toLowerCase() === (c.user || "").toLowerCase());
                                    if (!user && c.user) {
                                        const docRef = usersCollectionRef.doc();
                                        const userData = {
                                            roles: { user: true },
                                            name: c.user,
                                            tasks: [],
                                            recentProjects: [],
                                            importId
                                        };
                                        
                                        console.log("Inserting new user...");
                                        console.log({ userData });
                                        
                                        users.push({ name: c.user, id: docRef.id });
                                        c.userId = docRef.id;
                                        p.push(docRef.set(userData));
                                    } else {
                                        console.log("User found with name: " + c.user);
                                        if (user) c.userId = user.id;
                                        else delete c.userId;
                                    }

                                    // Get client id, create new client if needed
                                    const client = clients.find(clientDoc => (clientDoc.name || "").toLowerCase() === (c.client || "").toLowerCase());
                                    if (!client && c.client) {
                                        const docRef = clientsCollectionRef.doc();
                                        const clientData = {
                                            name: c.client,
                                            name_insensitive: ((c.client || "") as string).toUpperCase(),
                                            importId
                                        };
                                        
                                        console.log("Inserting new client...");
                                        console.log({ clientData });
                                        
                                        clients.push({ name: c.client, id: docRef.id });
                                        c.client = docRef.id;
                                        p.push(docRef.set(clientData));
                                    } else {
                                        if (client) c.client = client.id;
                                        else delete c.client;
                                    }

                                    // Get task id, create new task if needed
                                    const task = tasks.find(taskDoc => (taskDoc.name || "").toLowerCase() === (c.task || "").toLowerCase());
                                    if (!task && c.task) {
                                        const docRef = tasksCollectionRef.doc();
                                        const taskData = {
                                            name: c.task,
                                            name_insensitive: ((c.task || "") as string).toUpperCase(),
                                            importId
                                        };
                                        
                                        console.log("Inserting new task...");
                                        console.log({ taskData });
                                        
                                        tasks.push({ name: c.task, id: docRef.id });
                                        c.task = docRef.id;
                                        p.push(docRef.set(taskData));
                                    } else {
                                        if (task) c.task = task.id;
                                        else delete c.task;
                                    }

                                    return p;
                                }, []))
                                    .then(() => items);
                            })
                    } :
                    (items: any[]) => {
                        return new Promise<any[]>(resolve => resolve(items));
                    };

            const insertBigQueryFunc = (items: any) => {
                return insertRowsAsync(
                    {
                        dataSetId,
                        tableId: collection,
                        tableIdPrefix: "",
                        schemes: bigQuerySchemes
                    },
                    items
                )
            };

            const insertFirestoreFunc = (items: any[]) => {
                const db = admin.firestore();
                return filterFnAsync(items, db)
                    .then(filteredItems => fixForeignKeysFnAsync(filteredItems, db))
                    .then(fixedItems => addAsync(db, db.collection(collection), fixedItems));
            };

            const insertFuncAsync = insertDirectlyToBigquery ? insertBigQueryFunc : insertFirestoreFunc;

            // Load data from CSV in cloud storage and insert into bigquery
            return loadCsvAsync<any>(bucket, file, deserialise)
                .then(insertFuncAsync)
                .then(() => {
                    return snapshot.ref.update({ state: "Import finished" })
                });
        });
    });