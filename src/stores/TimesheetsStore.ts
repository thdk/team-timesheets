import { observable, computed, reaction, when } from 'mobx';
import { Doc } from "../Firestorable/Document";

import * as firebase from 'firebase/app'
import { ICollection, Collection } from "../Firestorable/Collection";
import store, { IRootStore } from './RootStore';

export interface IRegistration {
    description: string;
    time: number;
    project: string;
    task: string;
    date: firebase.firestore.Timestamp; // Todo: use Date and add conversion layer
    userId: string;
}

export interface IRegistrationsStore {
    registrations: ICollection<IRegistration>;
    registration?: Doc<IRegistration> | {};
    totalTime: number;
    save: () => void;
    getNew: () => Doc<Partial<IRegistration>>;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;
    readonly registrations: ICollection<IRegistration>;

    @observable registration: Doc<IRegistration> | {};


    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registrations = observable(new Collection<IRegistration>(() => rootStore.getCollection("registrations"), { realtime: true }));
        this.registration = {};

        const updateRegistrationQuery = () => {
            when(() => !!this.rootStore.user.user, () => {
                if (!rootStore.user.user) return;

                const moment = rootStore.view.moment;
                const endDate = moment.clone().add(1, "days").toDate();
                const startDate = moment.clone().toDate();
                this.registrations.query = ref => ref
                    .where("date", ">", startDate)
                    .where("date", "<=", endDate)
                    .where("userId", "==", rootStore.user.user!.uid);
            });
        };

        // update the query of the registration collection each time...
        // -- the view moment changes
        // -- the logged in user changes
        reaction(() => rootStore.view.moment, updateRegistrationQuery);
        reaction(() => rootStore.user.user, updateRegistrationQuery);
    }

    @computed get totalTime() {
        return Array.from(this.registrations.docs.values()).reduce((p, c) => p + (c.data.time || 0), 0);
    }

    save() {
        // TODO move to Document class for Firestorable (with dynamic validation)
        this.registration instanceof (Doc) &&
            this.registration.data.date &&
            this.registration.data.description &&
            this.registration.data.project &&
            this.registration.data.task &&
            this.registration.data.time &&
            this.registration.data.userId &&
            this.registration.save();
    }

    getNew() {
        if (!store.user.user) throw new Error("Can't add new registration if user is unknown");

        return this.registrations.newDoc({
            date: firebase.firestore.Timestamp.fromDate(this.toUTC(
                this.rootStore.view.moment.toDate())
            ),
            description: "",
            project: "",
            task: store.user.defaultTask,
            userId: store.user.user.uid
        });
    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
}
