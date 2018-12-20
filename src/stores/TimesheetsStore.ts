import { observable, computed, reaction, when } from 'mobx';
import { Doc } from "../Firestorable/Document";

import * as firebase from 'firebase/app'
import { ICollection, Collection } from "../Firestorable/Collection";
import store, { IRootStore } from './RootStore';
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IDocumentData {
    deleted: boolean;
}

export interface IRegistration extends IDocumentData {
    description: string;
    time: number;
    project: string;
    task: string;
    date: Date;
    userId: string;
    deleted: boolean; // TODO: should not be needed here as the app only needs to work with non deleted docs
}

export interface IRegistrationData {
    description: string;
    time: number;
    project: string;
    task: string;
    date: firebase.firestore.Timestamp; // Todo: use Date and add conversion layer
    userId: string;
    deleted: boolean;
}

export interface IRegistrationsStore {
    registrations: ICollection<IRegistration>;
    registration?: Doc<IRegistration> | {};
    totalTime: number;
    save: () => void;
    delete: () => void;
    getNew: () => Doc<Partial<IRegistration>>;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;
    readonly registrations: ICollection<IRegistration>;

    @observable registration: Doc<IRegistration> | {};


    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registrations = observable(new Collection(() => rootStore.getCollection("registrations"),
            {
                realtime: true,
                deserialize: deserializer.convertRegistration,
                serialize: serializer.convertRegistration
            }));

        this.registration = {};

        const updateRegistrationQuery = () => {
            when(() => this.rootStore.user.user instanceof(Doc), () => {
                const moment = rootStore.view.moment;
                const endDate = moment.clone().add(1, "days").toDate();
                const startDate = moment.clone().toDate();
                this.registrations.query = ref => ref
                    .where("deleted", "==", false)
                    .where("date", ">", startDate)
                    .where("date", "<=", endDate)
                    .where("userId", "==", (rootStore.user.user as Doc<IRegistration>).id);
            });
        };

        // update the query of the registration collection each time...
        // -- the view moment changes
        // -- the logged in user changes
        reaction(() => rootStore.view.moment, updateRegistrationQuery);
        reaction(() => rootStore.user.user, updateRegistrationQuery);
    }

    @computed get totalTime() {
        return Array.from(this.registrations.docs.values())
        .filter(r => !!r.data && !r.data.deleted)
        .reduce((p, c) => p + (c.data!.time || 0), 0);
    }

    save() {
        this.registration instanceof (Doc) &&
            this.registrations.addAsync(this.registration);
    }

    delete() {
        if (this.registration instanceof (Doc) && this.registration.data)
        {
            this.registration.data.deleted = true;
            this.save();
        }
    }

    getNew() {
        if (!(store.user.user instanceof(Doc))) throw new Error("Can't add new registration if user is unknown");

        // TODO: conversion toUTC should happen in de serializer
        return this.registrations.newDoc({
            date: this.toUTC(
                this.rootStore.view.moment.toDate()
            ),
            description: "",
            project: "",
            task: store.user.defaultTask,
            userId: store.user.user.id,
            deleted: false
        });
    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
}
