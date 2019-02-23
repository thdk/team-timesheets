import { Timestamp } from "@firebase/firestore-types";

export interface IRegistrationData {
    description: string;
    time: number;
    project: string;
    task: string;
    client: string;
    date: Timestamp;
    userId: string;
    deleted: boolean;
}