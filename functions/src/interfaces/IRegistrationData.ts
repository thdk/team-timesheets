
import { Timestamp } from "@google-cloud/firestore";

export interface IRegistrationData {
    description: string;
    time: number;
    project: string;
    task: string;
    client: string;
    date: Timestamp;
    userId: string;
    deleted: boolean;
    created?: Timestamp;
    modified?: Timestamp;
}

export interface IBigQueryRegistrationData extends Omit<IRegistrationData, "created" | "modified" | "date"> {
    created: string;
    modified: string;
    date: string;
}