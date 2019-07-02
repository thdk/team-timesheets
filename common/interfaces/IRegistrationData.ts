import { Timestamp } from "@firebase/firestore-types";
import { IPersistedEntity } from "./base";

export interface IRegistrationData extends IPersistedEntity {
    description: string;
    time: number;
    project: string;
    task: string;
    client: string;
    date: Timestamp;
    userId: string;
    deleted: boolean;
}