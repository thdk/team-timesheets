import { observable, computed, reaction, when, action, toJS, ObservableMap, observe, IObservableArray } from 'mobx';
import { Doc, ICollection, Collection } from "firestorable";
import store, { IRootStore } from './RootStore';
import * as deserializer from '../../common/serialization/deserializer';
import * as serializer from '../../common/serialization/serializer';
import { SortOrder } from '../components/GroupedRegistrations';
import { IRegistration, IRegistrationData } from '../../common/dist';
import moment from 'moment-es6';
import { firestore, auth } from '../firebase/myFirebase';
import { getLoggedInUserAsync } from '../firebase/firebase-utils';

export interface IGroupedRegistrations<T> {
    registrations: Doc<IRegistration, IRegistrationData>[];
    readonly groupKey: T;
    totalTime: number;
    isCollapsed: boolean;
}

export interface IRegistrationsStore {
    readonly clipboard: ObservableMap<string, IRegistration>;
    readonly selectedRegistrationDays: IObservableArray<Date>;
    readonly toggleSelectedRegistrationDay: (day: Date) => void;
    readonly registration: IRegistration | undefined;
    readonly registrationId?: string;
    readonly setSelectedRegistrationId: (id: string | undefined) => void;
    readonly saveSelectedRegistration: () => void;
    readonly updateSelectedRegistration: (data: Partial<IRegistration>) => void;
    readonly setSelectedRegistrationDefault: () => void;
    readonly deleteRegistrationsAsync: (...ids: string[]) => Promise<void[]>;
    readonly addRegistrations: (data: IRegistration[]) => void;

    readonly registrationsGroupedByDay: IGroupedRegistrations<Date>[];
    readonly registrationsGroupedByDayReversed: IGroupedRegistrations<Date>[];
    readonly registrationsGroupedByDaySortOrder: SortOrder;
    areGroupedRegistrationsCollapsed: boolean;
    readonly setRegistrationsGroupedByDaySortOrder: (sortOrder: SortOrder) => void;
    readonly cloneRegistration: (source: IRegistration) => IRegistration;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;
    private readonly registrations: ICollection<IRegistration, IRegistrationData>;
    readonly clipboard = observable(new Map<string, IRegistration>());

    @observable
    private _selectedRegistration = observable.box<IRegistration | undefined>();
    @observable
    private _selectedRegistrationId = observable.box<string | undefined>();

    @observable
    public selectedRegistrationDays = observable([] as Date[]);

    @observable
    private registrationsGroupedByDaySortOrderField = SortOrder.Descending;
    @observable
    public areGroupedRegistrationsCollapsed = true;

    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registrations = observable(new Collection<IRegistration, IRegistrationData>(firestore, () => rootStore.getCollection("registrations"),
            {
                realtime: true,
                deserialize: deserializer.convertRegistration,
                serialize: serializer.convertRegistration
            }));

        const updateRegistrationQuery = () => {
            // TODO: replace when whith a if else
            // clear the docs when there is no userId
            when(() => !!this.rootStore.user.userId, () => {
                const moment = rootStore.view.moment;
                const endDate = moment.clone().endOf("month").toDate();
                const startDate = moment.clone().startOf("month").toDate();
                this.registrations.query = ref => ref
                    .where("date", ">", startDate)
                    .where("date", "<=", endDate)
                    .where("userId", "==", rootStore.user.userId);
            });
        };

        // update the query of the registration collection each time...
        // -- the view moment changes
        // -- the logged in user changes
        reaction(() => rootStore.view.monthMoment, updateRegistrationQuery);
        reaction(() => rootStore.user.userId, userId => {
            if (userId) getLoggedInUserAsync(auth).then(() =>
                updateRegistrationQuery()
            );
            else this.registrations.unsubscribeAndClear();
        });

        reaction(() => this.areGroupedRegistrationsCollapsed, collapsed => {
            if (collapsed) {
                this.selectedRegistrationDays.clear();
            } else {
                this.selectedRegistrationDays.replace(
                    this.registrationsGroupedByDay.map(g => g.groupKey)
                );
            }
        })

        observe(this._selectedRegistrationId, change => this.setSelectedRegistration(change.newValue), true);
    }

    @computed
    public get registrationsGroupedByDaySortOrder() {
        return this.registrationsGroupedByDaySortOrderField;
    }

    @action
    public setRegistrationsGroupedByDaySortOrder(sortOrder: SortOrder) {
        this.registrationsGroupedByDaySortOrderField = sortOrder;
    }

    @computed get registrationsGroupedByDayReversed() {
        return this.getGroupedRegistrations(this.registrations, SortOrder.Descending);
    }

    @computed get registrationsGroupedByDay() {
        return this.getGroupedRegistrations(this.registrations);
    }

    private getGroupedRegistrations(registrations: ICollection<IRegistration, IRegistrationData>, sortOrder = SortOrder.Ascending) {
        const regs = Array.from(registrations.docs.values())
            .filter(doc => doc.data!.isPersisted && !doc.data!.deleted) // don't display drafts or deleted items
            .sort((a, b) => {
                const aTime = a.data!.date.getTime();
                const bTime = b.data!.date.getTime();
                return aTime > bTime ? 1 * sortOrder : aTime < bTime ? -1 * sortOrder : 0;
            });

        if (regs.length === 0) return [];
        return regs
            .reduce<IGroupedRegistrations<Date>[]>((p, c) => {
                const currentDayGroup = p[p.length - 1];
                if (currentDayGroup && c.data!.date.getTime() === currentDayGroup.groupKey.getTime()) {
                    currentDayGroup.registrations.push(c);

                    // Always make sure that the order within a group is stable
                    // Oldest on top
                    currentDayGroup.registrations = currentDayGroup.registrations.sort((a, b) => {
                        const aTime = a.data!.created!.getTime();
                        const bTime = b.data!.created!.getTime();
                        return aTime > bTime ? 1 : aTime < bTime ? -1 : 0;
                    })
                    currentDayGroup.totalTime = (currentDayGroup.totalTime || 0) + (c.data!.time || 0);
                } else {
                    p.push({
                        groupKey: c.data!.date,
                        registrations: [c],
                        totalTime: c.data!.time || 0,
                        isCollapsed: !this.selectedRegistrationDays.some(d => d === c.data!.date),
                    });
                }

                return p;
            }, []);
    }

    @computed
    public get registration() {
        return this._selectedRegistration.get();
    }

    @computed
    public get registrationId() {
        return this._selectedRegistrationId.get();
    }

    @action
    public setSelectedRegistrationId(id: string | undefined) {
        this._selectedRegistrationId.set(id);
    }

    public updateSelectedRegistration(data: Partial<IRegistration> | undefined) {
        this.registration && this._selectedRegistration.set(data ? { ...this.registration, ...data } : undefined);
    }

    @action
    private setSelectedRegistration(id: string | undefined) {
        const registration = id ? this.registrations.docs.get(id) : undefined;

        if (id && !registration) {
            // fetch the registration manually
            this.registrations.getAsync(id)
                .then(regDoc => this.setSelectedRegistrationObservable(regDoc.data))
        } else if (registration) {
            this.setSelectedRegistrationObservable(registration.data!);
        } else {
            this.setSelectedRegistrationObservable(undefined);
        }
    }

    @action
    public setSelectedRegistrationDefault() {
        this.getNewRegistrationDataAsync().then(data => {
            this.setSelectedRegistrationObservable(data);
        });
    }

    @action.bound
    private setSelectedRegistrationObservable(registration: IRegistration | undefined) {
        this._selectedRegistration.set(registration);
    }

    public deleteRegistrationsAsync(...ids: string[]) {
        // Todo: make updateAsync with data === "delete" use a batch in firestorable package.
        return Promise.all(ids.map(id => this.registrations.updateAsync(id, "delete")));
    }

    public addRegistrations(data: IRegistration[]) {
        this.registrations.addAsync(data);
    }

    public cloneRegistration(source: IRegistration) {
        if (!store.view.day) throw new Error("Can't clone a registration without a specific new date");

        return { ...source, date: this.toUTC(store.view.moment.toDate()) };
    }

    public toggleSelectedRegistrationDay(date: Date) {
        const index = this.selectedRegistrationDays.findIndex(d => d.getTime() === date.getTime());
        if (index === -1) {
            this.selectedRegistrationDays.push(date);
        } else {
            this.selectedRegistrationDays.replace([...this.selectedRegistrationDays.slice(0, index), ...this.selectedRegistrationDays.slice(index + 1)]);
        }
    }

    private getNewRegistrationDataAsync(): Promise<IRegistration> {
        return when(() => !!this.rootStore.user.authenticatedUser)
            .then(() => {
                const regMoment = this.rootStore.view.day === undefined ? moment().startOf("day") : undefined;

                if (!this.rootStore.user.authenticatedUser || !this.rootStore.user.userId) throw new Error("User must be set");

                const {
                    recentProjects = [],
                    defaultTask: task = this.rootStore.config.tasks.docs.size ? Array.from(this.rootStore.config.tasks.docs.keys())[0] : undefined,
                    defaultClient: client = undefined
                } = this.rootStore.user.authenticatedUser || {};

                return {
                    date: this.toUTC(
                        regMoment ? regMoment.toDate() : this.rootStore.view.moment.toDate()
                    ),
                    task,
                    client,
                    userId: this.rootStore.user.userId,
                    project: recentProjects.length ? recentProjects[0] : undefined,
                    isPersisted: false,
                };
            });
    }

    public saveSelectedRegistration() {
        if (this.registration) {
            const { registration } = this;
            this.registrations
                .updateAsync(this.registrationId, registration)
                .then(() => {
                    const { project = undefined } = registration || {};
                    // TODO: move set recent project to firebase function
                    // triggering for every update/insert of a registration?
                    if (store.user.userId && store.user.authenticatedUser && project) {
                        const recentProjects = toJS(store.user.authenticatedUser.recentProjects);
                        const oldProjectIndex = recentProjects.indexOf(project);

                        // don't update the user document if the current project was already most recent
                        if (oldProjectIndex !== 0) {
                            if (oldProjectIndex > 0) {
                                // project id exists already in the list
                                // move it to the first place
                                recentProjects.splice(oldProjectIndex, 1);
                                recentProjects.unshift(project);
                            }
                            else {
                                // project id not in list yet
                                // add it in the first place
                                recentProjects.unshift(project);
                            }

                            store.user.updateAuthenticatedUser({ recentProjects });
                        }
                    }
                });
        }

    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
}
