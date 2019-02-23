import { ICollection, Collection } from "../Firestorable/Collection";
import { IRootStore } from "./RootStore";
import { reaction, computed, observable, action } from "mobx";

import * as firebase from 'firebase/app';
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IReport } from "../../common/dist";

export interface IReportStore {
    requestReport: (userId: string, year: number, month: number) => void;
    report: Doc<IReport> | undefined;
    reportUrl?: string;
}

export class ReportStore implements IReportStore {
    // private rootStore: IRootStore;
    private readonly reports: ICollection<IReport>;
    @observable.ref reportUrl?: string;
    constructor(rootStore: IRootStore) {
        // this.rootStore = rootStore;
        this.reports = new Collection(rootStore.getCollection.bind(this, "reports"), {
            realtime: true,
        });

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
                const {userId} = rootStore.user;
                firestorable.storage.ref(`reports/${year}/${month}/${userId}.csv`).getDownloadURL()
                    .then(url => this.reportUrl = url);
            }
        })
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
        if (this.reports.docs.size) {
            return Array.from(this.reports.docs.values())[0];
        }

        return undefined;
    }
}