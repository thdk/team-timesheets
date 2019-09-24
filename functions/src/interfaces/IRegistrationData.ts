
import * as admin from 'firebase-admin';

export interface IRegistrationData {
    description: string;
    time: number;
    project: string;
    task: string;
    client: string;
    date: admin.firestore.Timestamp;
    userId: string;
    deleted: boolean;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    importId?: string;
}

export interface IBigQueryRegistrationData extends Omit<IRegistrationData, "created" | "modified" | "date"> {
    created: string;
    modified: string;
    date: string;
}