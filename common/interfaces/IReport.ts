import { FieldValue } from "@firebase/firestore-types";

export interface IReport {
    userId: string;
    month: number;
    year: number;
    status: "waiting" | "error" | "complete";
    created: FieldValue;
}