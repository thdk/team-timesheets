import { ICollection, Collection } from "../Firestorable/Collection";
import { IRootStore } from "./RootStore";

export interface IReportStore {
    requestReport: (userId: string, year: number, month: number) => void;
}

export interface IReport {
    userId: string;
    month: number;
    year: number;
    status: "waiting" | "error";
}

export class ReportStore implements IReportStore {
    // private rootStore: IRootStore;

    private readonly reports: ICollection<IReport>;
    constructor(rootStore: IRootStore) {
        // this.rootStore = rootStore;
        this.reports = new Collection(rootStore.getCollection.bind(this, "reports"), {
            realtime: true,
        });
    }

    requestReport(userId: string, year: number, month: number) {
        this.reports.addAsync({
            status: 'waiting',
            userId,
            year,
            month
        } as IReport);
    }
}