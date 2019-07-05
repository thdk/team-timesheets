import { Timestamp } from "@google-cloud/firestore";

export interface IProjectData {
    name: string;
    icon?: string;
    created?: Timestamp;
    modified?: Timestamp;
    createdBy?: string;
    deleted?: boolean;
}