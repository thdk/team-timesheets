import { observable, computed, reaction, when } from 'mobx';
import { Doc } from "../Firestorable/Document";

import * as firebase from 'firebase/app'
import { ICollection, Collection } from "../Firestorable/Collection";
import store, { IRootStore } from './RootStore';
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IGroupedRegistrations {
    readonly registrations: Doc<IRegistration>[];
    readonly date: Date;
    totalTime: number;
}

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
    date: firebase.firestore.Timestamp;
    userId: string;
    deleted: boolean;
}

export interface IRegistrationsStore {
    readonly registrations: ICollection<IRegistration>;
    registration?: Doc<IRegistration> | {};
    readonly registrationsGroupedByDay: IGroupedRegistrations[];
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
        reaction(() => rootStore.user.userId, updateRegistrationQuery);
    }

    @computed get registrationsGroupedByDay() {
        const registrations = Array.from(this.registrations.docs.values())
            .sort((a, b) => {
                const aTime = a.data!.date.getTime();
                const bTime = b.data!.date.getTime();
                return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
            });
        if (registrations.length === 0) return [];
        return registrations
            .slice(1)
            .reduce((p, c) => {
                const currentDayGroup = p[p.length - 1];
                if (c.data!.date.getTime() === currentDayGroup.date.getTime()) {
                    currentDayGroup.registrations.push(c);
                    currentDayGroup.totalTime += c.data!.time;
                } else {
                    p.push({
                        date: c.data!.date,
                        registrations: [c],
                        totalTime: c.data!.time
                    });
                }

                return p;
            }, [{
                date: registrations[0].data!.date,
                registrations: [registrations[0]],
                totalTime: registrations[0].data!.time
            }]);
    }

    save() {
        // TODO: undefined values should be converted to firestore.FieldValue.delete()
        // in order to save incomplete forms
        // worst case is to save empty string / array / object
        this.registration instanceof (Doc)
            && this.registration.data
            && this.registration.data.time
            && this.registration.data.project
            && this.registration.data.task
            && this.registration.data.date
            && this.registration.data.description
            && this.registration.data.userId
            && this.registrations.addAsync(this.registration.data, this.registration.id);
    }

    delete() {
        if (this.registration instanceof (Doc) && this.registration.data) {
            this.registration.data.deleted = true;
            this.save();
        }
    }

    getNew() {
        if (!(store.user.user instanceof (Doc))) throw new Error("Can't add new registration if user is unknown");

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
