import { ICollection, Collection, Doc, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from "./root-store";
import { reaction, computed, observable, action } from "mobx";

import * as firebase from 'firebase/app';
import { IReport } from "../../common/dist";
import { firestore, storage } from "../firebase/my-firebase";

export interface IReportStore {
    requestReport: (userId: string, year: number, month: number) => void;
    report: Doc<IReport> | undefined;
    reportUrl?: string;
    reports: ICollection<IReport>;
}

export class ReportStore implements IReportStore {
    // private rootStore: IRootStore;
    public readonly reports: ICollection<IReport>;

    @observable.ref reportUrl?: string;

    constructor(rootStore: IRootStore) {
        // this.rootStore = rootStore;
        this.reports = new Collection(
            firestore,
            "reports", {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
            },
            {
                logger: console.log,
            },
        );

        const updateReportsQuery = () => {
            const { month, year } = rootStore.view;
            if (!!rootStore.user.userId && month && year) {
                this.reports.query = ref => ref
                    .where("userId", "==", rootStore.user.userId)
                    .where("month", "==", month)
                    .where("year", "==", year)
                    .limit(1)
                    .orderBy("created", "desc");
            };
        };

        reaction(() => rootStore.view.monthMoment, updateReportsQuery);
        reaction(() => rootStore.user.userId, updateReportsQuery);

        reaction(() => this.report, (r) => {
            if (r && r.data && r.data.status === "complete") {
                const { month, year } = rootStore.view;
                const { userId } = rootStore.user;
                storage.ref(`reports/${year}/${month}/${userId}.csv`).getDownloadURL()
                    .then(url => this.reportUrl = url);
            }
        });
    }

    @action
    requestReport(userId: string, year: number, month: number) {
        this.reportUrl = undefined;
        this.reports.addAsync({
            status: 'waiting',
            userId,
            year,
            month,
            created: firebase.firestore.FieldValue.serverTimestamp()
        } as IReport);
    }

    @computed
    public get report() {
        return this.reports.docs[0];
    }
}
