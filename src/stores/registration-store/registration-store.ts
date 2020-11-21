import { Doc, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { observable, computed, reaction, when, action, toJS } from 'mobx';
import moment from 'moment';

import { IRootStore } from '../root-store';
import * as deserializer from '../../../common/serialization/deserializer';
import * as serializer from '../../../common/serialization/serializer';
import { SortOrder } from '../../containers/timesheet/days';
import { IRegistration, IRegistrationData } from '../../../common/dist';
import { FirestorableStore } from "../firestorable-store";

export interface IGroupedRegistrations<T> {
    registrations: Doc<IRegistration, IRegistrationData>[];
    readonly groupKey: T;
    totalTime: number;
    isCollapsed: boolean;
}

export interface IRegistrationsStore extends RegistrationStore { };

const createQuery = (
    userId: string | undefined,
    moment: moment.Moment,
) => {
    if (userId) {
        const endDate = moment.clone().endOf("month").toDate();
        const startDate = moment.clone().startOf("month").toDate();
        const queryFn = (ref: firebase.firestore.CollectionReference) => {
            let query = ref
                .where("date", ">=", startDate)
                .where("date", "<=", endDate)
                .where("userId", "==", userId.toString());

            return query;
        }

        return queryFn;
    }
    else {
        return null;
    }
};

const createDefaults = (
    overrideDefaultsWith: Partial<IRegistration> | undefined,
    rootStore: IRootStore,
) => {
    return when(() => !!rootStore.user.divisionUser)
        .then(() => {
            if (!rootStore.user.divisionUser || !rootStore.user.divisionUser.id) throw new Error("User must be set");

            const {
                recentProjects = [],
                defaultTask: task = rootStore.config.tasks.length ? rootStore.config.tasks[0].id : undefined,
                defaultClient: client = undefined,
            } = rootStore.user.divisionUser || {};

            const recentActiveProjects = recentProjects
                .filter(projectId => rootStore.projects.activeProjects
                    .some(p => p.id === projectId));

            return {
                date: rootStore.view.day === undefined
                    ? moment().startOf("day").toDate()
                    : rootStore.view.moment.toDate(),
                task,
                client,
                userId: rootStore.user.divisionUser.id,
                project: recentActiveProjects.length ? recentActiveProjects[0] : undefined,
                isPersisted: false,
                description: "",
                ...overrideDefaultsWith
            };
        });
};

export class RegistrationStore extends FirestorableStore<IRegistration, IRegistrationData> implements IRegistrationsStore {
    private rootStore: IRootStore;
    readonly clipboard = observable(new Map<string, IRegistration>());

    @observable
    public selectedRegistrationDays = observable([] as string[]);

    @observable
    private registrationsGroupedByDaySortOrderField = SortOrder.Descending;
    @observable
    public areGroupedRegistrationsCollapsed = true;

    private reactionDisposeFns: (() => void)[];

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        },
    ) {
        super(
            {
                collection: "registrations",
                collectionOptions: {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.auto,
                    deserialize: deserializer.convertRegistration,
                    serialize: serializer.convertRegistration,
                    query: createQuery(
                        rootStore.user.divisionUser?.id,
                        rootStore.view.moment,
                    ),
                },
                createNewDocumentDefaults: (overrideDefaultsWith) => createDefaults(overrideDefaultsWith, rootStore),
            },
            {
                firestore,
            },
        );

        this.rootStore = rootStore;

        const updateRegistrationQuery = (userId: string | undefined) => {
            this.collection.query = createQuery(
                userId,
                rootStore.view.moment,
            );
        };

        // update the query of the registration collection each time...
        // -- the view moment changes
        // -- the logged in user changes
        // -- the organisation changes
        this.reactionDisposeFns = [
            reaction(() => rootStore.view.monthMoment, () => {
                updateRegistrationQuery(rootStore.user.divisionUser?.id);
            }),
            reaction(() => rootStore.user.authenticatedUser, user => {
                if (!user || !user.uid)
                    updateRegistrationQuery(undefined);
                else
                    updateRegistrationQuery(user.divisionUserId || user.uid);
            }, {
                fireImmediately: true,
            }),
            reaction(() => this.areGroupedRegistrationsCollapsed, collapsed => {
                if (collapsed) {
                    this.selectedRegistrationDays.clear();
                } else {
                    this.selectedRegistrationDays.replace(
                        this.registrationsGroupedByDay.map(g => g.groupKey)
                    );
                }
            }),
        ];
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
        return this.getGroupedRegistrations(this.collection, SortOrder.Descending);
    }

    @computed get registrationsGroupedByDay() {
        return this.getGroupedRegistrations(this.collection);
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
                    currentDayGroup.registrations = currentDayGroup.registrations.sort(
                        (a, b) => {
                            const aTime = a.data!.created!.getTime();
                            const bTime = b.data!.created!.getTime();
                            return aTime > bTime ? 1 : aTime < bTime ? -1 : 0;
                        }
                    );
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
            this.selectedRegistrationDays.replace([
                ...this.selectedRegistrationDays.slice(0, index),
                ...this.selectedRegistrationDays.slice(index + 1),
            ]);
        }
    }

    public getRegistrationById(id: string): IRegistration | null {
        const doc = this.collection.get(id);
        return doc && doc.data ? doc.data : null;
    }

    public saveSelectedRegistration() {
        if (this.activeDocument) {
            const { activeDocument } = this;

            const saveOrUpdateAsync = (registration: Partial<IRegistration>, id: string | undefined): Promise<void[] | string> => {
                return id
                    ? this.updateDocument(registration, id)
                    : this.addDocument(registration as IRegistration); // TODO: unsafe typing!
            };

            return saveOrUpdateAsync(activeDocument, this.activeDocumentId)
                .then(() => {
                    const { project = undefined } = activeDocument || {};
                    // TODO: move set recent project to firebase function
                    // triggering for every update/insert of a registration?
                    if (this.rootStore.user.divisionUser?.id && project) {
                        const recentProjects = toJS(this.rootStore.user.divisionUser.recentProjects);
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

                            this.rootStore.user.updateDivisionUser({ recentProjects });
                        }
                    }
                });
        }
        else {
            return Promise.reject("No registration selected to save");
        }
    }

    public dispose() {
        this.reactionDisposeFns.forEach(fn => fn());
        this.collection.dispose();
    }
}
