
import { firestore } from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, typeSnapshot } from "./FirestoreUtils";
import { observable, ObservableMap, reaction } from "mobx";
import { OptionalId } from "./types";
import { CollectionMap } from "../store";

export interface ICollection<T extends IDocument> {
    readonly docs: ObservableMap<string, T>;
    query?: (ref: firestore.CollectionReference) => firestore.Query;
    getDocs: () => void;
    updateAsync: (data: T) => Promise<void>;
    addAsync: (data: OptionalId<T>) => Promise<T>;
    deleteAsync: (id: string) => Promise<void>;
}

export interface IDocument {
    readonly id: string;
}

export interface ICollectionOptions {
    realtime?: boolean;
}

export class Collection<T extends IDocument> implements ICollection<T> {
    public docs: ObservableMap<string, T> = observable(new Map);
    @observable public query?: (ref: firestore.CollectionReference) => firestore.Query;
    private readonly name: keyof CollectionMap;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    private readonly isRealtime: boolean;
    private unsubscribeFirestore?: () => void;
    private readonly queryReactionDisposable: () => void;

    constructor(name: keyof CollectionMap, firestore: firebase.firestore.Firestore, options: ICollectionOptions = {}) {
        const { realtime = false } = options;

        this.isRealtime = realtime;
        this.name = name;
        this.collectionRef = firestore.collection(this.name);

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

                snapshot.docChanges().forEach(change => {
                    const { doc: { id }, doc } = change;
                    if (change.type === "added" || change.type === "modified") {
                        this.docs.set(id, typeSnapshot(doc));
                    }
                    else if (change.type === "removed") {
                        this.docs.delete(id);
                    }
                });
            });
    }

    public updateAsync(data: T) {
        return updateAsync(this.collectionRef, data);
    }

    public addAsync(data: OptionalId<T>) {
        return addAsync(this.collectionRef, data);
    }

    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete();
    }

    public dispose() {
        if (this.unsubscribeFirestore) this.unsubscribeFirestore();

        this.queryReactionDisposable();
    }
}