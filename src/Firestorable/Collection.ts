
import { firestore } from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, typeSnapshot } from "./FirestoreUtils";
import { observable, ObservableMap, reaction, transaction } from "mobx";
import { OptionalId } from "./types";
import { CollectionMap } from "../store";
import { Doc } from "./Document";

export interface ICollection<T extends IDocument> {
    readonly docs: ObservableMap<string, Doc<T>>;
    query?: (ref: firestore.CollectionReference) => firestore.Query;
    getDocs: () => void;
    newDoc: (data: OptionalId<T>) => Doc<T>;
    updateAsync: (data: T) => Promise<void>;
    addAsync: (data: OptionalId<T>) => Promise<T>;
    deleteAsync: (id: string) => Promise<void>;
}

export interface IDocument {
    readonly id: string;
    // readonly collectionRef: firebase.firestore.CollectionReference;
}

export interface ICollectionOptions {
    realtime?: boolean;
}

export class Collection<T extends IDocument> implements ICollection<T> {
    public docs: ObservableMap<string, Doc<T>> = observable(new Map);
    @observable public query?: (ref: firestore.CollectionReference) => firestore.Query;
    private readonly name: keyof CollectionMap;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    private readonly isRealtime: boolean;
    private unsubscribeFirestore?: () => void;
    private readonly queryReactionDisposable: () => void;

    constructor(name: keyof CollectionMap, getFirestoreCollection: (name: string) => firebase.firestore.CollectionReference, options: ICollectionOptions = {}) {
        const { realtime = false } = options;

        this.isRealtime = realtime;
        this.name = name;
        this.collectionRef = getFirestoreCollection(this.name);

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
                            this.docs.set(id, new Doc<T>(this.collectionRef, typeSnapshot(doc)));
                        }
                        else if (change.type === "removed") {
                            this.docs.delete(id);
                        }
                    });
                })

            });
    }

    public newDoc(data: OptionalId<T>) {
        return new Doc<T>(this.collectionRef, data);
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public updateAsync(data: T) {
        return updateAsync(this.collectionRef, data);
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public addAsync(data: OptionalId<T>) {
        return addAsync(this.collectionRef, data);
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete();
    }

    public dispose() {
        if (this.unsubscribeFirestore) this.unsubscribeFirestore();

        this.queryReactionDisposable();
    }
}