import { ICollection, Collection, Doc, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from "../root-store";
import { reaction, computed, observable, action, makeObservable } from "mobx";

import { IReport } from "../../../common/dist";
import { serverTimestamp, Firestore, limit, orderBy, query, where } from "firebase/firestore";

export interface IReportStore {
    requestReport: (userId: string, year: number, month: number) => void;
    report: Doc<IReport> | undefined;
    reportUrl?: string;
    reports: ICollection<IReport>;
}

export class ReportStore implements IReportStore {
    // private rootStore: IRootStore;
    public readonly reports: ICollection<IReport>;

    reportUrl?: string;

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: Firestore,
        },
    ) {
        makeObservable(this, {
            reportUrl: observable.ref,
            requestReport: action,
            report: computed
        });

        // this.rootStore = rootStore;
        this.reports = new Collection(
            firestore,
            "reports", {
            realtimeMode: RealtimeMode.on,
            fetchMode: FetchMode.auto,
        },
            {
                // logger: console.log,
            },
        );

        const updateReportsQuery = () => {
            const { month, year } = rootStore.view;
            if (!!rootStore.user.divisionUser && month && year) {
                this.reports.query = ref => query(
                    ref,
                    where("userId", "==", rootStore.user.divisionUser?.id),
                    where("month", "==", month),
                    where("year", "==", year),
                    limit(1),
                    orderBy("created", "desc"),
                );
            }
        };

        reaction(() => rootStore.view.monthMoment, updateReportsQuery);
        reaction(() => rootStore.user.divisionUser, updateReportsQuery);
    }

    requestReport(userId: string, year: number, month: number) {
        this.reportUrl = undefined;
        this.reports.addAsync({
            status: 'waiting',
            userId,
            year,
            month,
            created: serverTimestamp()
        } as IReport);
    }

    public get report() {
        return this.reports.docs[0];
    }
}
