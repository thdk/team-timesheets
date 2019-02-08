import { observable, reaction, computed, IObservableValue, action } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";

import { IRootStore } from "./RootStore";
import { IRegistration, IRegistrationData, IGroupedRegistrations } from "./TimesheetsStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IDashboardStore {
    readonly setProjectFilter: (projectId: string) => void;
    readonly setUserFilter: (userId: string) => void;
    readonly setTaskFilter: (taskId: string) => void;

    readonly registrationsGroupedByUser: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByTask: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByProject: IGroupedRegistrations<string>[];
}

export class DashboardStore implements IDashboardStore {
    private readonly registrationsField: ICollection<IRegistration>;

    @observable private startDate: IObservableValue<Date | undefined> = observable.box();
    @observable private endDate: IObservableValue<Date | undefined> = observable.box();
    @observable.ref private userId: string | undefined = undefined;
    @observable private taskId: IObservableValue<string | undefined> = observable.box();
    @observable private projectId: IObservableValue<string | undefined> = observable.box();

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
                    this.endDateFilter(
                        this.startDateFilter(
                            ref.where("deleted", "==", false)
                        )
                    )
                )
                ;
        };

        // update the query of the registration collection each time...
        // -- a filter changes (userId, startDate, endDate)
        // TODO: add a Filter button in UI to group all filter changes into one new search query
        reaction(() => this.startDate, updateRegistrationQuery);
        reaction(() => this.endDate, updateRegistrationQuery);
        reaction(() => this.userId, updateRegistrationQuery);

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
        const userId = this.userId;
        return (query: firebase.firestore.Query) => userId ? query.where("userId", "==", userId) : query;
    }

    @computed
    get registrationsGroupedByUser() {
        // no need to group when userId is included in the filter
        if (this.registrations.length === 0 || this.userId) return [];

        return this.createRegistrationsGroup(reg => reg.userId);
    }

    @computed
    get registrationsGroupedByProject() {
        // no need to group when projectId is included in the filter
        if (this.registrations.length === 0 || this.projectId.get()) return [];

        return this.createRegistrationsGroup(reg => reg.project || "");
    }

    @computed
    get registrationsGroupedByTask() {
        // no need to group when taskId is included in the filter
        if (this.registrations.length === 0 || this.taskId.get()) return [];

        return this.createRegistrationsGroup(reg => reg.task || "");
    }

    @computed
    private get registrations() {
        return Array.from(this.registrationsField.docs.values())
            .filter(doc => doc.data!.isPersisted) // don't display drafts (TODO: move to collection.ts?)
    }

    @action
    public setProjectFilter(projectId: string) {
        this.projectId.set(projectId);
    }

    @action
    public setTaskFilter(taskId: string) {
        this.taskId.set(taskId);
    }

    @action
    public setUserFilter(userId: string) {
        this.userId = userId;
    }

    private createRegistrationsGroup = <T>(keySelector: (reg: IRegistration) => T): IGroupedRegistrations<T>[] => {
        return this.registrations
            .reduce<IGroupedRegistrations<T>[]>((p, c) => {
                const currentGroup = p[p.length - 1];
                if (currentGroup && keySelector(c.data!) === currentGroup.groupKey) {
                    currentGroup.registrations.push(c);
                    currentGroup.totalTime = (currentGroup.totalTime || 0) + (c.data!.time || 0);
                } else {
                    p.push({
                        groupKey: keySelector(c.data!),
                        registrations: [c],
                        totalTime: c.data!.time || 0
                    });
                }

                return p;
            }, []);
    }
}