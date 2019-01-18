import { observable, computed, reaction, when, action, transaction, toJS, ObservableMap } from 'mobx';
import { Doc } from "../Firestorable/Document";

import * as firebase from 'firebase/app'
import { ICollection, Collection } from "../Firestorable/Collection";
import store, { IRootStore } from './RootStore';
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';
import { getLoggedInUserAsync } from '../Firestorable/Firestorable';

export interface IGroupedRegistrations {
    readonly registrations: Doc<IRegistration>[];
    readonly date: Date;
    totalTime: number;
}

export interface IDocumentData {
    deleted?: boolean;
}

export interface IRegistration {
    description?: string;
    time?: number;
    project?: string;
    task?: string;
    client?: string;
    date: Date;
    userId: string;
}

export interface IRegistrationData {
    description: string;
    time: number;
    project: string;
    task: string;
    client: string;
    date: firebase.firestore.Timestamp;
    userId: string;
    deleted: boolean;
}

export interface IRegistrationsStore {
    readonly clipboard: ObservableMap<string, true>;
    readonly registrations: ICollection<IRegistration>;
    readonly registration: Doc<Partial<IRegistration>> | undefined;
    registrationId?: string;
    readonly registrationsGroupedByDay: IGroupedRegistrations[];
    readonly save: () => void;
    readonly newRegistration: () => void;
    readonly cloneRegistration: (source: IRegistration) => IRegistration;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;
    readonly registrations: ICollection<IRegistration>;
    readonly clipboard = observable(new Map<string, true>());

    @observable.ref registrationId?: string;

    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registrations = observable(new Collection<IRegistration, IRegistrationData>(() => rootStore.getCollection("registrations"),
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
                    .where("deleted", "==", false)
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
            if (userId) getLoggedInUserAsync().then(() =>
                updateRegistrationQuery()
            );
            else this.registrations.unsubscribeAndClear();
        });
    }

    @computed get registrationsGroupedByDay() {
        const registrations = Array.from(this.registrations.docs.values())
            .sort((a, b) => {
                const aTime = a.data!.date.getTime();
                const bTime = b.data!.date.getTime();
                return aTime > bTime ? 1 : aTime < bTime ? -1 : 0;
            });

        if (registrations.length === 0) return [];
        return registrations
            .slice(1)
            .reduce((p, c) => {
                const currentDayGroup = p[p.length - 1];
                if (c.data!.date.getTime() === currentDayGroup.date.getTime()) {
                    currentDayGroup.registrations.push(c);
                    currentDayGroup.totalTime = (currentDayGroup.totalTime || 0) + (c.data!.time || 0);
                } else {
                    p.push({
                        date: c.data!.date,
                        registrations: [c],
                        totalTime: c.data!.time || 0
                    });
                }

                return p;
            }, [{
                date: registrations[0].data!.date,
                registrations: [registrations[0]],
                totalTime: registrations[0].data!.time || 0
            }]);
    }

    @computed
    public get registration() {
        if (!store.user.user) throw new Error("User must be set");

        const registration = this.registrationId
            ? this.registrations.docs.get(this.registrationId)
            : undefined;


        return registration;
    }

    public cloneRegistration(source: IRegistration) {
        if (!store.view.day) throw new Error("Can't clone a registration without a specific new date");

        return {...source, date: this.toUTC(store.view.moment.toDate())};
    }

    @action
    public newRegistration() {
        if (!store.user.user) throw new Error("User must be set");

        const {
            data: {
                recentProjects = [],
                defaultTask = store.config.tasks.docs.size ? Array.from(store.config.tasks.docs.keys())[0] : undefined
            } = {}
            , id: userId
        } = store.user.user;

        const registration = this.registrations.newDoc<IRegistration>({
            date: this.toUTC(
                this.rootStore.view.moment.toDate()
            ),
            task: defaultTask,
            userId,
            project: recentProjects.length ? recentProjects[0] : undefined
        });

        transaction(() => {
            this.registrationId = registration.id;
            this.registrations.docs.set(registration.id, registration);
        });
    }

    public save() {
        if (store.timesheets.registration) {
            const registration = store.timesheets.registration;
            store.timesheets.registrations
                .updateAsync(registration.id, registration.data!)
                .then(() => {
                    const { project = undefined } = registration.data || {};
                    // TODO: move set recent project to firebase function
                    // triggering for every update/insert of a registration?
                    if (store.user.userId && store.user.user && project) {
                        const recentProjects = toJS(store.user.user.data!.recentProjects);
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

                            store.user.userId && store.user.users.updateAsync(store.user.userId, { recentProjects })
                        }
                    }
                });
        }

    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
}
