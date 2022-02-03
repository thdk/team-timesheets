import { Doc, ICollection, RealtimeMode, FetchMode, CrudStore } from "firestorable";
import { observable, computed, reaction, action, toJS, makeObservable } from 'mobx';
import moment from 'moment';

import { IRootStore } from '../root-store';
import * as deserializer from '../../../common/serialization/deserializer';
import * as serializer from '../../../common/serialization/serializer';
import { SortOrder } from '../../containers/timesheet/days';
import { IRegistration, IRegistrationData } from '../../../common/dist';
import { CollectionReference, Firestore, query, where } from "firebase/firestore";

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
        const queryFn = (ref: CollectionReference<IRegistrationData>) => {
            let q = query(
                ref,
                where("date", ">=", startDate),
                where("date", "<=", endDate),
                where("userId", "==", userId.toString(),
                ));

            return q;
        }

        return queryFn;
    }
    else {
        return null;
    }
};

export class RegistrationStore extends CrudStore<IRegistration, IRegistrationData> implements IRegistrationsStore {
    private rootStore: IRootStore;
    readonly clipboard = observable(new Map<string, IRegistration>());

    public selectedRegistrationDays = observable([] as string[]);

    private registrationsGroupedByDaySortOrderField = SortOrder.Descending;
    public areGroupedRegistrationsCollapsed = true;

    private reactionDisposeFns: (() => void)[];

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: Firestore,
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
                createNewDocumentDefaults: (overrideDefaultsWith) => {
                    return { ...this.defaults, ...overrideDefaultsWith };
                },
            },
            {
                firestore,
            },
        );

        makeObservable<RegistrationStore, "registrationsGroupedByDaySortOrderField">(this, {
            selectedRegistrationDays: observable,
            registrationsGroupedByDaySortOrderField: observable,
            areGroupedRegistrationsCollapsed: observable,
            registrationsGroupedByDaySortOrder: computed,
            registrationsTotalTime: computed,
            dayRegistrations: computed,
            defaults: computed,
            setRegistrationsGroupedByDaySortOrder: action,
            registrationsGroupedByDayReversed: computed,
            registrationsGroupedByDay: computed
        });

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

    public get defaults() {
        if (!this.rootStore.user.divisionUser || !this.rootStore.user.divisionUser.id) {
            return undefined;
        }

        const {
            defaultTask: task = this.rootStore.tasks.tasks.length ? this.rootStore.tasks.tasks[0].id : undefined,
            defaultClient: client = undefined,
            defaultProjectId: project,
            id: userId,
        } = this.rootStore.user.divisionUser || {};

        return {
            date: this.rootStore.view.day === undefined
                ? moment().startOf("day").toDate()
                : this.rootStore.view.moment.toDate(),
            task,
            client,
            userId,
            project,
            isPersisted: false,
            description: "",
        };
    }
    public get registrationsGroupedByDaySortOrder() {
        return this.registrationsGroupedByDaySortOrderField;
    }

    public get registrationsTotalTime() {
        return this.registrationsGroupedByDay.reduce((p, c) => p + (c.totalTime || 0), 0);
    }

    public get dayRegistrations() {
        const groups = this.registrationsGroupedByDay.filter(g => g.groupKey === this.rootStore.view.moment.toDate().toDateString());
        const group = groups[0] ||
        {
            groupKey: this.rootStore.view.startOfDay?.toDateString(),
            totalTime: 0,
            registrations: [],
        };

        return group;
    }

    public setRegistrationsGroupedByDaySortOrder(sortOrder: SortOrder) {
        this.registrationsGroupedByDaySortOrderField = sortOrder;
    }

    get registrationsGroupedByDayReversed() {
        return this.getGroupedRegistrations(this.collection, SortOrder.Descending);
    }

    get registrationsGroupedByDay() {
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

        const sourceJs = toJS(source);

        // remove undefined values from source so they will not override our default values
        Object.keys(sourceJs).
            forEach((key) => (sourceJs as any)[key] === undefined && delete (sourceJs as any)[key]);

        // set created to undefined so a new timestamp will be set when saving it
        return { ...this.defaults, ...sourceJs, created: undefined, date, isPersisted: true };
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

    public async saveSelectedRegistration() {
        if (this.activeDocument) {
            const { activeDocument } = this;

            const saveOrUpdateAsync = (registration: Partial<IRegistration>, id: string | undefined): Promise<void[] | string> => {
                return id
                    ? this.updateDocument(registration, id)
                    : this.addDocument(registration as IRegistration); // TODO: unsafe typing!
            };

            await saveOrUpdateAsync(activeDocument, this.activeDocumentId)
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

            this.setActiveDocumentId(undefined);
        }
        else {
            await Promise.reject("No registration selected to save");
        }
    }

    public dispose() {
        this.reactionDisposeFns.reverse().forEach(fn => fn());
        super.dispose();
    }
}
