import { observable, reaction, computed, action, makeObservable } from "mobx";
import { ICollection, Collection, RealtimeMode } from "firestorable";

import moment from 'moment';

import { IRootStore } from "./root-store";
import { IGroupedRegistrations } from "./registration-store/registration-store";
import * as deserializer from '../../common/serialization/deserializer';
import * as serializer from '../../common/serialization/serializer';
import { TimePeriod } from "../components/time-period-select";
import { IRegistration, IRegistrationData } from "../../common/dist";
import { Firestore, query, Query, where } from "firebase/firestore";

export interface IDashboardStore {
    readonly setProjectFilter: (projectId: string | undefined) => void;
    readonly setUserFilter: (userId: string | undefined) => void;
    readonly setTaskFilter: (taskId: string | undefined) => void;
    readonly setTimePeriodFilter: (timePeriod: TimePeriod) => void;

    readonly registrationsGroupedByUser: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByTask: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByProject: IGroupedRegistrations<string>[];

    readonly projectFilterValue?: string;
    readonly taskFilterValue?: string;
    readonly userFilterValue?: string;
    readonly timePeriodFilterValue?: TimePeriod;

}

export class DashboardStore implements IDashboardStore {
    private readonly registrationsField: ICollection<IRegistration, IRegistrationData>;

    private userFilterValueField: string | undefined = undefined;
    private taskFilterValueField: string | undefined = undefined;
    private projectFilterValueField: string | undefined = undefined;
    private timePeriodFilterField: TimePeriod | undefined = undefined;

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: Firestore,
        },
    ) {
        makeObservable<DashboardStore, "userFilterValueField" | "taskFilterValueField" | "projectFilterValueField" | "timePeriodFilterField" | "startDateFilter" | "endDateFilter" | "userIdFilter" | "projectIdFilter" | "startDate" | "endDate" | "registrations">(this, {
            userFilterValueField: observable.ref,
            taskFilterValueField: observable.ref,
            projectFilterValueField: observable.ref,
            timePeriodFilterField: observable.ref,
            startDateFilter: computed,
            endDateFilter: computed,
            userIdFilter: computed,
            projectIdFilter: computed,
            registrationsGroupedByUser: computed,
            registrationsGroupedByProject: computed,
            registrationsGroupedByTask: computed,
            startDate: computed,
            endDate: computed,
            registrations: computed,
            setProjectFilter: action,
            setTaskFilter: action,
            setUserFilter: action,
            setTimePeriodFilter: action
        });

        this.registrationsField = new Collection<IRegistration, IRegistrationData>(
            firestore,
            "registrations",
            {
                realtimeMode: RealtimeMode.on,
                deserialize: deserializer.convertRegistration,
                serialize: serializer.convertRegistration,
                name: "Dashboard registrations",
            },
            {
                // logger: console.log
            },
        );

        const updateRegistrationQuery = () => {
            if (!rootStore.user.divisionUser || !this.timePeriodFilterField) {
                this.registrationsField.query = null;
            } else {
                this.registrationsField.query = ref =>
                    this.userIdFilter(
                        this.projectIdFilter(
                            this.endDateFilter(
                                this.startDateFilter(
                                    query(ref, where("deleted", "==", false))
                                )
                            )
                        )
                    ) as Query<IRegistrationData>;
            }
        };

        // update the query of the registration collection each time...
        // -- a filter changes (userId, startDate, endDate)
        // TODO: add a Filter button in UI to group all filter changes into one new search query
        reaction(() => this.timePeriodFilterField, updateRegistrationQuery);
        reaction(() => this.userFilterValue, updateRegistrationQuery);
        reaction(() => this.projectFilterValue, updateRegistrationQuery);
        reaction(() => rootStore.user.divisionUser, updateRegistrationQuery);
    }

    private get startDateFilter() {
        const startDate = this.startDate;
        return (q: Query) => startDate ? query(q, where("date", ">=", startDate)) : q;
    }

    private get endDateFilter() {
        const endDate = this.endDate;
        return (q: Query) => endDate ? query(q, where("date", "<=", endDate)) : q;
    }

    private get userIdFilter() {
        const userId = this.userFilterValue;
        return (q: Query) => userId ? query(q, where("userId", "==", userId)) : q;
    }

    private get projectIdFilter() {
        return (q: Query) => this.projectFilterValue
            ? query(q, where("project", "==", this.projectFilterValue))
            : q;
    }

    get registrationsGroupedByUser() {
        // no need to group when userId is included in the filter
        if (this.registrations.length === 0) return [];

        const registrationsPerUser = this.createRegistrationsGroup(reg => reg.userId);

        return registrationsPerUser;
    }

    get registrationsGroupedByProject() {
        if (this.registrations.length === 0) return [];

        return this.createRegistrationsGroup(reg => reg.project || "")
            .sort((a, b) => b.totalTime - a.totalTime);;
    }

    get registrationsGroupedByTask() {
        if (this.registrations.length === 0) return [];

        return this.createRegistrationsGroup(reg => reg.task || "")
            .sort((a, b) => b.totalTime - a.totalTime);
    }

    private get startDate() {
        const today = moment(new Date());
        switch (this.timePeriodFilterField) {
            case TimePeriod.ThisWeek:
                return today.clone().startOf('week').toDate();
            case TimePeriod.ThisMonth:
                return today.clone().startOf('month').toDate();
            case TimePeriod.LastMonth:
                return today.clone().subtract(1, 'months').startOf('month').toDate();
            case TimePeriod.ThisYear:
                return today.clone().startOf('year').toDate();
            case TimePeriod.LastYear:
                return today.clone().subtract(1, 'years').startOf('year').toDate();
            default:
                return undefined;
        }
    }

    private get endDate() {
        const today = moment(new Date());
        switch (this.timePeriodFilterField) {
            case TimePeriod.ThisWeek:
                return today.clone().endOf('week').toDate();
            case TimePeriod.ThisMonth:
                return today.clone().endOf('month').toDate();
            case TimePeriod.LastMonth:
                return today.clone().subtract(1, 'months').endOf('month').toDate();
            case TimePeriod.ThisYear:
                return today.clone().endOf('year').toDate();
            case TimePeriod.LastYear:
                return today.clone().subtract(1, 'years').endOf('year').toDate();
            default:
                return undefined;
        }
    }

    public get taskFilterValue() {
        return this.taskFilterValueField;
    }

    public get userFilterValue() {
        return this.userFilterValueField;
    }

    public get projectFilterValue() {
        return this.projectFilterValueField;
    }

    public get timePeriodFilterValue() {
        return this.timePeriodFilterField;
    }

    private get registrations() {
        return this.registrationsField.docs
            .filter(doc => doc.data!.isPersisted) // don't display drafts (TODO: move to collection.ts?)
    }

    public setProjectFilter(projectId: string | undefined) {
        this.projectFilterValueField = projectId;
    }

    public setTaskFilter(taskId: string | undefined) {
        this.taskFilterValueField = taskId;
    }

    public setUserFilter(userId: string | undefined) {
        this.userFilterValueField = userId;
    }

    setTimePeriodFilter(timePeriod: TimePeriod) {
        this.timePeriodFilterField = timePeriod;
    }

    private createRegistrationsGroup = <T>(keySelector: (reg: IRegistration) => T): IGroupedRegistrations<T>[] => {
        const groupedMap = new Map<T, IGroupedRegistrations<T>>();

        this.registrations
            .forEach(c => {
                const key = keySelector(c.data!);
                const group = groupedMap.get(key);
                if (group) {
                    group.totalTime += c.data!.time || 0;
                    group.registrations.push(c);
                }
                else {
                    groupedMap.set(key, {
                        groupKey: keySelector(c.data!),
                        registrations: [c],
                        totalTime: c.data!.time || 0,
                        isCollapsed: true
                    });
                }
            });

        return Array.from(groupedMap.values());
    }
}