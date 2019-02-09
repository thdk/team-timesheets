import { observable, reaction, computed, IObservableValue, action } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";

import { IRootStore } from "./RootStore";
import { IRegistration, IRegistrationData, IGroupedRegistrations } from "./TimesheetsStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IDashboardStore {
    readonly setProjectFilter: (projectId: string | undefined) => void;
    readonly setUserFilter: (userId: string | undefined) => void;
    readonly setTaskFilter: (taskId: string | undefined) => void;

    readonly registrationsGroupedByUser: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByTask: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByProject: IGroupedRegistrations<string>[];

    readonly projectFilterValue?: string;
    readonly taskFilterValue?: string;
    readonly userFilterValue?: string;
}

export class DashboardStore implements IDashboardStore {
    private readonly registrationsField: ICollection<IRegistration>;

    @observable private startDate: IObservableValue<Date | undefined> = observable.box();
    @observable private endDate: IObservableValue<Date | undefined> = observable.box();
    @observable.ref private userFilterValueField: string | undefined = undefined;
    @observable.ref private taskFilterValueField: string | undefined = undefined;
    @observable.ref private projectFilterValueField: string | undefined = undefined;

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

        this.registrationsField.getDocs();
    }

    @computed
    private get startDateFilter() {
        const startDate = this.startDate.get()
        return (query: firebase.firestore.Query) => startDate ? query.where("date", ">=", startDate) : query;
    }

    @computed
    private get endDateFilter() {
        const endDate = this.endDate.get()
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

    public get taskFilterValue() {
        return this.taskFilterValueField;
    }

    public get userFilterValue() {
        return this.userFilterValueField;
    }

    public get projectFilterValue() {
        return this.projectFilterValueField;
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