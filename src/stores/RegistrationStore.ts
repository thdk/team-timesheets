import { observable } from "mobx";
import store, { IRootStore } from "../store";
import { IDocument } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";

import * as firebase from 'firebase/app'

export interface IRegistration extends IDocument {
    description: string;
    time: number;
    project: string;
    task: string;
    date: firebase.firestore.Timestamp; // Todo: use Date and add conversion layer
}

export interface IRegistrationsStore {
    registration?: Doc<IRegistration> | {};
    save: () => void;
    getNew: () => Doc<IRegistration>;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;

    @observable registration: Doc<IRegistration> | {};

    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registration = {};
    }

    save() {
        // TODO move to Document class for Firestorable (with dynamic validation)
        this.registration instanceof(Doc) &&
            this.registration.data.date &&
            this.registration.data.description &&
            this.registration.data.project &&
            this.registration.data.task &&
            this.registration.data.time &&
            this.registration.data.id &&
            this.registration.save();
    }

    getNew() {
        return this.rootStore.registrations.newDoc({
            date: firebase.firestore.Timestamp.fromDate(this.toUTC(
                this.rootStore.view.moment.toDate())
            ),
            description: "",
            project: "",
            task: store.user.defaultTask,
            time: 1
        });
    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
}
