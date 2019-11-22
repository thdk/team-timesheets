import { BigQueryField } from "./utils";
import { IProjectData, IBigQueryProjectData } from "../interfaces/IProjectData";
import { IRegistrationData, IBigQueryRegistrationData } from "../interfaces/IRegistrationData";
import * as admin from 'firebase-admin';
import { IUserData } from "../interfaces/IUserData";

export const convertRegistration = (firebaseChange: FirebaseFirestore.DocumentSnapshot) => {
    const reg = firebaseChange.data() as unknown as IRegistrationData;
    return {
        id: firebaseChange.id,
        description: reg.description,
        time: reg.time,
        date: reg.date ? reg.date.toDate().toISOString().replace('Z', '') : null,
        task: reg.task,
        project: reg.project,
        client: reg.client,
        userId: reg.userId,
        created: reg.created ? reg.created.toDate().toISOString().replace('Z', '') : null,
        modified: reg.modified ? reg.modified.toDate().toISOString().replace('Z', '') : null,
        deleted: reg.deleted,
        importId: reg.importId,
    };
};

export const convertProject = (firebaseChange: FirebaseFirestore.DocumentSnapshot) => {
    const project = firebaseChange.data() as unknown as IProjectData;

    return {
        id: firebaseChange.id,
        name: project.name,
        icon: project.icon,
        createdBy: project.createdBy,
        created: project.created ? project.created.toDate().toISOString().replace('Z', '') : null,
        modified: project.modified ? project.modified.toDate().toISOString().replace('Z', '') : null,
        deleted: project.deleted
    };
}

export const convertUser = (firebaseChange: FirebaseFirestore.DocumentSnapshot) => {
    const user = firebaseChange.data() as unknown as IUserData;

    return {
        id: firebaseChange.id,
        name: user.name,
        created: user.created ? user.created.toDate().toISOString().replace('Z', '') : null,
        modified: user.modified ? user.modified.toDate().toISOString().replace('Z', '') : null,
        deleted: user.deleted
    };
}

const convertCsvProjectToBigQuery = (data: any) => {
    // validate input
    const { name, icon, id } = data;
    if (!id) throw new Error("Cannot insert project data without id");
    if (!name) throw new Error("Name is missing for project with id: " + id);

    const now = new Date().toISOString().replace('Z', '');
    return ({
        id: id,
        name: name,
        icon: icon || null,
        deleted: false,
        created: now,
        modified: now,
        createdBy: ""
    } as IBigQueryProjectData);
}

// Example csv data
// id	name	isArchived
// ipid-1	Automated price sync	true
const convertCsvProjectToFirestore = (data: any) => {
    // validate input
    const { name, icon, id, isArchived = "true" } = data;
    if (!id) throw new Error("Cannot insert project data without id");
    if (!name) throw new Error("Name is missing for project with id: " + id);

    const now = admin.firestore.Timestamp.now();
    return ({
        id: id,
        name: name,
        name_insensitive: ((name || "") as string).toUpperCase(),
        icon: icon || null,
        deleted: false,
        created: now,
        modified: now,
        createdBy: "",
        isArchived: ((isArchived || "") as string).toLowerCase() === "true"
    } as IProjectData);
}

// Example CSV data
// date	                    description	    project	                task	                time	userId	                        id	                    client
// 2020-07-23 00:00:00 UTC	Foobar	        sLpzfJLhAHNeswVtcIub	XDiim1EzIR4JpSTF94sb	3	    Egzn2JunuWZj47KWxBIccm91bp33	ggVaApCbnJVW3LmqegoK	cTXyre5UPdgOz4EXj6tQ
const convertCsvRegistrationToBigQuery = (data: any) => {
    // validate input
    const { time, date, id, description, client, task, project, userId } = data;
    if (!id) throw new Error("Cannot insert registrations data without id");

    const now = new Date().toISOString().replace('Z', '');
    return ({
        id,
        time: time || 0,
        date,
        deleted: false,
        created: now,
        modified: now,
        description,
        task,
        client,
        project,
        userId
    } as IBigQueryRegistrationData);
}

// Example CSV data
// date	        description	    project	                task	    time	user                [id]	                client          [timeOffset]
// 2020-01-01	Foobar	        Project Name	        Task name   3	    Thomas Dekiere	    [ggVaApCbnJVW3LmqegoK]	Client Name     [5]
const convertCsvRegistrationToFirestore = (data: any) => {
    try {
        // validate input
        const { time, date, id, description, client, task, project, user, timeOffset = 0 } = data;

        const nowDate = new Date();
        // Use timeoffset to use a date in the past as created/modified
        // Useful to insert data that doesn't need to by synced with bigquery
        // Sync with bigquery only syncs data with modified date > last sync date
        if (timeOffset) {
            nowDate.setDate(nowDate.getDate() - timeOffset);
        }

        const nowTimestamp = admin.firestore.Timestamp.fromDate(nowDate);
        return ({
            id,
            time: +(time || 0),
            date: admin.firestore.Timestamp.fromDate(new Date(date)),
            deleted: false,
            created: nowTimestamp,
            modified: nowTimestamp,
            description,
            task,
            client,
            project,
            user
        });
    }
    catch (e) {
        console.error({
            error: "Can't deserialize data.",
            data,
            exception: e,
        });

        throw new Error("Can't deserialize data.");
    }
}

export const csvDerserializers = {
    "bigquery": {
        "registrations": (data: any) => convertCsvRegistrationToBigQuery(data),
        "projects": (data: any) => convertCsvProjectToBigQuery(data),
    },
    "firestore": {
        "registrations": (data: any) => convertCsvRegistrationToFirestore(data),
        "projects": (data: any) => convertCsvProjectToFirestore(data),
    }
};

export const projectSchema: BigQueryField[] = [
    { "name": "icon", "type": "STRING" },
    { "name": "name", "type": "STRING" },
    { "name": "deleted", "type": "BOOLEAN" },
    { "name": "created", "type": "TIMESTAMP" },
    { "name": "modified", "type": "TIMESTAMP" },
    { "name": "createdBy", "type": "STRING" },
    { "name": "id", "type": "STRING" },
    { "name": "importId", "type": "STRING" },
];

export const registrationSchema: BigQueryField[] = [
    { "name": "id", "type": "STRING" },
    { "name": "created", "type": "TIMESTAMP" },
    { "name": "deleted", "type": "BOOLEAN" },
    { "name": "date", "type": "TIMESTAMP" },
    { "name": "description", "type": "STRING" },
    { "name": "modified", "type": "TIMESTAMP" },
    { "name": "project", "type": "STRING" },
    { "name": "task", "type": "STRING" },
    { "name": "client", "type": "STRING" },
    { "name": "time", "type": "FLOAT" },
    { "name": "userId", "type": "STRING" },
    { "name": "importId", "type": "STRING" },
];

export const userSchema: BigQueryField[] = [
    { "name": "name", "type": "STRING" },
    { "name": "deleted", "type": "BOOLEAN" },
    { "name": "created", "type": "TIMESTAMP" },
    { "name": "modified", "type": "TIMESTAMP" },
    { "name": "id", "type": "STRING" },
    { "name": "importId", "type": "STRING" },
];

export type BigQueryTableSchemes = { [collection: string]: BigQueryField[] };
export const bigQuerySchemes: BigQueryTableSchemes = {
    "registrations": registrationSchema,
    "projects": projectSchema,
    "users": userSchema,
};

export const firestoreBigQueryMap: { [collection: string]: { convert: (change: FirebaseFirestore.DocumentSnapshot) => any, schema: BigQueryField[], dateField?: string } } = {
    "registrations": {
        convert: convertRegistration,
        schema: bigQuerySchemes["registrations"]
    },
    "projects": {
        convert: convertProject,
        schema: bigQuerySchemes["projects"],
    },
    "users": {
        convert: convertUser,
        schema: bigQuerySchemes["users"],
    }
}
