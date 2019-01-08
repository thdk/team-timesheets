import { firestore } from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, getAsync } from "./FirestoreUtils";
import { observable, ObservableMap, reaction, transaction } from 'mobx';
import { Doc } from "./Document";
import { IDisposable } from "./types";

export interface ICollection<T> extends IDisposable {
    readonly docs: ObservableMap<string, Doc<T>>;
    query?: (ref: firestore.CollectionReference) => firestore.Query;
    getDocs: () => void;
    newDoc: <X extends Partial<T>>(data: X) => Doc<X>;
    updateAsync: (id: string, data: Partial<T>) => Promise<void>;
    addAsync: (data: T, id?: string) => Promise<string>;
    getAsync: (id: string) => Promise<Doc<T>>;
    deleteAsync: (id: string) => Promise<void>;
    unsubscribeAndClear: () => void;
}

export interface ICollectionOptions<T, K> {
    realtime?: boolean;
    deserialize?: (firestoreData: K) => T;
    serialize?: (appData: Partial<T>) => Partial<K>;
}

export class Collection<T, K = T> implements ICollection<T> {
    public docs: ObservableMap<string, Doc<T>> = observable(new Map);
    @observable public query?: (ref: firestore.CollectionReference) => firestore.Query;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    private readonly isRealtime: boolean;
    private unsubscribeFirestore?: () => void;
    private readonly queryReactionDisposable: () => void;
    private readonly deserialize: (firestoreData: K) => T;
    private readonly serialize: (appData: Partial<T>) => Partial<K>;

    constructor(getFirestoreCollection: () => firebase.firestore.CollectionReference, options: ICollectionOptions<T, K> = {}) {
        const { realtime = false,
            deserialize = (x: K) => x as unknown as T,
            serialize = (x: Partial<T>) => x as unknown as Partial<K>
        } = options;

        this.isRealtime = realtime;
        this.deserialize = deserialize;
        this.serialize = serialize;

        this.collectionRef = getFirestoreCollection();

        this.queryReactionDisposable = reaction(() => this.query, this.getDocs.bind(this));
    }

    public getDocs() {
        if (this.unsubscribeFirestore) this.unsubscribeFirestore();

        if (this.docs.size) this.docs.clear();

        this.unsubscribeFirestore = (this.query ? this.query(this.collectionRef) : this.collectionRef)
            .onSnapshot(snapshot => {
                if (!this.isRealtime) this.unsubscribeFirestore!();

                if (snapshot.empty)
                    return;

                transaction(() => {
                    snapshot.docChanges().forEach(change => {
                        const { doc: { id }, doc } = change;
                        if (change.type === "added" || change.type === "modified") {
                            const firestoreData = doc.data() as K;
                            const data = this.deserialize(firestoreData);
                            this.docs.set(id, new Doc<T>(this.collectionRef, data, id));
                        }
                        else if (change.type === "removed") {
                            this.docs.delete(id);
                        }
                    });
                })

            });
    }

    public newDoc<X extends Partial<T>>(data: X) {
        return new Doc<X>(this.collectionRef, data);
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    // TODO: add update settings: Merge | Overwrite
    public updateAsync(id: string, data: Partial<T>) {
        return this.getAsync(id)
            .then(
                oldData => {
                    updateAsync(this.collectionRef, Object.assign(this.serialize({...oldData.data, ...data}), { id }))
                },
                () => {
                    // trying to update something that doesn't exist => add it instead
                    addAsync(this.collectionRef, Object.assign(this.serialize(data), { id }))
                        .then(() => { }) // convert Promise<string> into Promise<void> :(
                });
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public addAsync(data: T | null, id?: string) {
        const firestoreData = data ? this.serialize(data) : {};
        return addAsync(this.collectionRef, firestoreData, id);
    }

    // TODO: If realtime is enabled, we can safely fetch from the docs instead of a new get request
    public getAsync(id: string) {
        return getAsync<K>(this.collectionRef, id).then(doc => {
            return new Doc<T>(this.collectionRef, this.deserialize(doc), id);
        });
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    // WARNING: NEEDS INVESTIGATION: No snapshot change received when deleting a registration
    // Temporary always manually remove the registration from the docs.
    // update: first findings are that when a query is set, there won't be delete snapshot changes
    // so when we have an active query => always manually update the docs
    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete().then(() => {
            this.query && this.docs.delete(id);
        }, () => {
            throw new Error("Could not delete document");
        });
    }

    public dispose() {
        this.unsubscribeAndClear();
        this.queryReactionDisposable();
    }

    public unsubscribeAndClear() {
        if (this.unsubscribeFirestore) this.unsubscribeFirestore();
        this.unsubscribeFirestore = undefined;
        this.docs.clear();
    }
}