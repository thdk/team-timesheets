import { observable, computed, reaction, when, action, toJS, ObservableMap, IObservableArray } from 'mobx';
import { Doc, ICollection, Collection, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from './root-store';
import * as deserializer from '../../common/serialization/deserializer';
import * as serializer from '../../common/serialization/serializer';
import { SortOrder } from '../containers/registrations/days';
import { IRegistration, IRegistrationData } from '../../common/dist';
import moment from 'moment';
import { firestore } from '../firebase/my-firebase';

export interface IGroupedRegistrations<T> {
    registrations: Doc<IRegistration, IRegistrationData>[];
    readonly groupKey: T;
    totalTime: number;
    isCollapsed: boolean;
}

export interface IRegistrationsStore {
    readonly clipboard: ObservableMap<string, IRegistration>;
    readonly selectedRegistrationDays: IObservableArray<string>;
    readonly toggleSelectedRegistrationDay: (day: string, force?: boolean) => void;
    readonly registration: IRegistration | undefined;
    readonly registrationId?: string;
    readonly setSelectedRegistration: (id: string | undefined) => void;
    readonly saveSelectedRegistration: () => void;
    readonly updateSelectedRegistration: (data: Partial<IRegistration>) => void;
    readonly setSelectedRegistrationDefault: (moment?: moment.Moment) => void;
    readonly deleteRegistrationsAsync: (...ids: string[]) => Promise<void[]>;
    readonly addRegistrations: (data: IRegistration[]) => void;

    readonly registrationsTotalTime: number;
    readonly registrationsGroupedByDay: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByDayReversed: IGroupedRegistrations<string>[];
    readonly registrationsGroupedByDaySortOrder: SortOrder;
    areGroupedRegistrationsCollapsed: boolean;
    readonly setRegistrationsGroupedByDaySortOrder: (sortOrder: SortOrder) => void;
    readonly copyRegistrationToDate: (source: Omit<IRegistration, "date" | "isPersisted">, newDate: Date) => IRegistration;
    readonly getRegistrationById: (id: string) => IRegistration | null;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;
    private readonly registrations: ICollection<IRegistration, IRegistrationData>;
    readonly clipboard = observable(new Map<string, IRegistration>());

    private _selectedRegistration = observable.box<IRegistration | undefined>();

    private _selectedRegistrationId = observable.box<string | undefined>();

    @observable
    public selectedRegistrationDays = observable([] as string[]);

    @observable
    private registrationsGroupedByDaySortOrderField = SortOrder.Descending;
    @observable
    public areGroupedRegistrationsCollapsed = true;


    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registrations = new Collection<IRegistration, IRegistrationData>(
            firestore,
            "registrations",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.auto,
                deserialize: deserializer.convertRegistration,
                serialize: serializer.convertRegistration
            },
            {
                logger: console.log,
            },
        );

        const updateRegistrationQuery = (userId: string | undefined) => {
            // TODO: replace when whith a if else
            // clear the docs when there is no userId
            if (userId) {
                const moment = rootStore.view.moment;
                const endDate = moment.clone().endOf("month").toDate();
                const startDate = moment.clone().startOf("month").toDate();
                this.registrations.query = ref => ref
                    .where("date", ">=", startDate)
                    .where("date", "<=", endDate)
                    .where("userId", "==", rootStore.user.userId);
            }
            else {
                this.registrations.query = null;
            }
        };

        // update the query of the registration collection each time...
        // -- the view moment changes
        // -- the logged in user changes
        reaction(() => rootStore.view.monthMoment, () => updateRegistrationQuery(rootStore.user.userId));
        reaction(() => rootStore.user.userId, userId => {
            updateRegistrationQuery(userId)
        });

        reaction(() => this.areGroupedRegistrationsCollapsed, collapsed => {
            if (collapsed) {
                this.selectedRegistrationDays.clear();
            } else {
                this.selectedRegistrationDays.replace(
                    this.registrationsGroupedByDay.map(g => g.groupKey)
                );
            }
        });
    }

    @computed
    public get registrationsGroupedByDaySortOrder() {
        return this.registrationsGroupedByDaySortOrderField;
    }

    @computed
    public get registrationsTotalTime() {
        return this.registrationsGroupedByDay.reduce((p, c) => p + (c.totalTime || 0), 0);
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
            .reduce<IGroupedRegistrations<string>[]>((p, c) => {
                const currentDayGroup = p[p.length - 1];
                if (currentDayGroup && c.data!.date.toDateString() === currentDayGroup.groupKey) {
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
                        groupKey: c.data!.date.toDateString(),
                        registrations: [c],
                        totalTime: c.data!.time || 0,
                        isCollapsed: !this.selectedRegistrationDays.some(d => d === c.data!.date.toDateString()),
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

    public updateSelectedRegistration(data: Partial<IRegistration> | undefined) {
        this.registration && this._selectedRegistration.set(data ? { ...this.registration, ...data } : undefined);
    }

    @action
    public setSelectedRegistration(id: string | undefined) {

        if ((!id && this._selectedRegistration) || (id !== this._selectedRegistrationId.get())) {
            this._selectedRegistrationId.set(id);

            const registration = id ? this.registrations.get(id) : undefined;

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
    }

    @action
    public setSelectedRegistrationDefault(moment?: moment.Moment) {
        this.getNewRegistrationDataAsync(moment).then(data => {
            this.setSelectedRegistrationObservable(data);
        });
    }

    @action.bound
    private setSelectedRegistrationObservable(registration: IRegistration | undefined) {
        this._selectedRegistration.set(registration);
    }

    public deleteRegistrationsAsync(...ids: string[]) {
        // Todo: make updateAsync with data === "delete" use a batch in firestorable package.
        return this.registrations.updateAsync(null, ...ids);
    }

    public addRegistrations(data: IRegistration[]) {
        this.registrations.addAsync(data);
    }

    public copyRegistrationToDate(source: Omit<IRegistration, "date" | "isPersisted">, newDate: Date) {
        const date = newDate;

        // set created to undefined so a new timestamp will be set when saving it
        return { ...source, created: undefined, date, isPersisted: true };
    }

    public toggleSelectedRegistrationDay(date: string, force = false) {
        const index = this.selectedRegistrationDays.findIndex(d => d === date);
        if (index === -1) {
            this.selectedRegistrationDays.push(date);
        } else if (!force) {
            this.selectedRegistrationDays.replace([...this.selectedRegistrationDays.slice(0, index), ...this.selectedRegistrationDays.slice(index + 1)]);
        }
    }

    public getRegistrationById(id: string): IRegistration | null {
        const doc = this.registrations.get(id);
        return doc && doc.data ? doc.data : null;
    }

    private getNewRegistrationDataAsync(registrationMoment?: moment.Moment): Promise<IRegistration> {
        return when(() => !!this.rootStore.user.authenticatedUser)
            .then(() => {
                const regMoment = registrationMoment
                    ? registrationMoment
                    : this.rootStore.view.day === undefined ? moment().startOf("day") : undefined;

                if (!this.rootStore.user.authenticatedUser || !this.rootStore.user.userId) throw new Error("User must be set");

                const {
                    recentProjects = [],
                    defaultTask: task = this.rootStore.config.tasks.docs.length ? this.rootStore.config.tasks.docs[0].id : undefined,
                    defaultClient: client = undefined
                } = this.rootStore.user.authenticatedUser || {};

                const recentActiveProjects = recentProjects
                    .filter(projectId => this.rootStore.projects.activeProjects
                        .some(p => p.id === projectId));

                return {
                    date:
                        regMoment ? regMoment.toDate() : this.rootStore.view.moment.toDate()
                    ,
                    task,
                    client,
                    userId: this.rootStore.user.userId,
                    project: recentActiveProjects.length ? recentActiveProjects[0] : undefined,
                    isPersisted: false,
                };
            });
    }

    public saveSelectedRegistration() {
        if (this.registration) {
            const { registration } = this;

            const saveOrUpdateAsync = (registration: IRegistration, id: string | undefined): Promise<void[] | string> => {
                return id
                    ? this.registrations.updateAsync(registration, id)
                    : this.registrations.addAsync(registration);

            };

            saveOrUpdateAsync(registration, this.registrationId)
                .then(() => {
                    const { project = undefined } = registration || {};
                    // TODO: move set recent project to firebase function
                    // triggering for every update/insert of a registration?
                    if (this.rootStore.user.userId && this.rootStore.user.authenticatedUser && project) {
                        const recentProjects = toJS(this.rootStore.user.authenticatedUser.recentProjects);
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

                            this.rootStore.user.updateAuthenticatedUser({ recentProjects });
                        }
                    }
                });
        }
    }
}
