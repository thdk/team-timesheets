import { observable, reaction, computed, action, when } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";

import moment from 'moment-es6';

import { IRootStore } from "./RootStore";
import { IGroupedRegistrations } from "./TimesheetsStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';
import { TimePeriod } from "../components/Controls/TimePeriodSelect";
import { IRegistration, IRegistrationData } from "../../common/dist";

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

    @observable.ref private userFilterValueField: string | undefined = undefined;
    @observable.ref private taskFilterValueField: string | undefined = undefined;
    @observable.ref private projectFilterValueField: string | undefined = undefined;
    @observable.ref private timePeriodFilterField: TimePeriod | undefined = undefined;

    constructor(rootStore: IRootStore) {

        this.registrationsField = observable(new Collection<IRegistration, IRegistrationData>(() => rootStore.getCollection("registrations"),
            {
                realtime: true,
                deserialize: deserializer.convertRegistration,
                serialize: serializer.convertRegistration
            }));

        const updateRegistrationQuery = () => {
            this.registrationsField.query = ref =>
                this.userIdFilter(
                    this.projectIdFilter(
                        this.endDateFilter(
                            this.startDateFilter(
                                ref.where("deleted", "==", false)
                            )
                        )
                    )
                );
        };

        // update the query of the registration collection each time...
        // -- a filter changes (userId, startDate, endDate)
        // TODO: add a Filter button in UI to group all filter changes into one new search query
        reaction(() => this.startDate, updateRegistrationQuery);
        reaction(() => this.endDate, updateRegistrationQuery);
        reaction(() => this.userFilterValue, updateRegistrationQuery);
        reaction(() => this.projectFilterValue, updateRegistrationQuery);

        // don't load docs without filters!!!!
        // otherwise firebase quoata will fly pretty fast
        when(() => !!rootStore.user.authenticatedUser && !!this.timePeriodFilterValue, () => {
            this.registrationsField.getDocs();
        });
    }

    @computed
    private get startDateFilter() {
        const startDate = this.startDate;
        return (query: firebase.firestore.Query) => startDate ? query.where("date", ">=", startDate) : query;
    }

    @computed
    private get endDateFilter() {
        const endDate = this.endDate;
        return (query: firebase.firestore.Query) => endDate ? query.where("date", "<=", endDate) : query;
    }

    @computed
    private get userIdFilter() {
        const userId = this.userFilterValue;
        return (query: firebase.firestore.Query) => userId ? query.where("userId", "==", userId) : query;
    }

    @computed
    private get projectIdFilter() {
        return (query: firebase.firestore.Query) => this.projectFilterValue ? query.where("project", "==", this.projectFilterValue) : query;
    }

    @computed
    get registrationsGroupedByUser() {
        // no need to group when userId is included in the filter
        if (this.registrations.length === 0) return [];

        const registrationsPerUser = this.createRegistrationsGroup(reg => reg.userId);

        return registrationsPerUser;
    }

    @computed
    get registrationsGroupedByProject() {
        if (this.registrations.length === 0) return [];

        return this.createRegistrationsGroup(reg => reg.project || "")
            .sort((a, b) => b.totalTime - a.totalTime);;
    }

    @computed
    get registrationsGroupedByTask() {
        if (this.registrations.length === 0) return [];

        return this.createRegistrationsGroup(reg => reg.task || "")
            .sort((a, b) => b.totalTime - a.totalTime);
    }

    @computed
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

    @computed
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

    @computed
    private get registrations() {
        return Array.from(this.registrationsField.docs.values())
            .filter(doc => doc.data!.isPersisted) // don't display drafts (TODO: move to collection.ts?)
    }

    @action
    public setProjectFilter(projectId: string | undefined) {
        this.projectFilterValueField = projectId;
    }

    @action
    public setTaskFilter(taskId: string | undefined) {
        this.taskFilterValueField = taskId;
    }

    @action
    public setUserFilter(userId: string | undefined) {
        this.userFilterValueField = userId;
    }

    @action setTimePeriodFilter(timePeriod: TimePeriod) {
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
                        totalTime: c.data!.time || 0
                    });
                }
            });

        return Array.from(groupedMap.values());
    }
}