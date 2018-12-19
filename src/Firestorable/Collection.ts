import { firestore } from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, getAsync } from "./FirestoreUtils";
import { observable, ObservableMap, reaction, transaction } from 'mobx';
import { Doc } from "./Document";

export interface ICollection<T> {
    readonly docs: ObservableMap<string, Doc<T>>;
    query?: (ref: firestore.CollectionReference) => firestore.Query;
    getDocs: () => void;
    newDoc: (data: Partial<T>) => Doc<Partial<T>>;
    updateAsync: (id: string, data: T) => Promise<void>;
    addAsync: (doc: Doc<T>) => Promise<string>;
    getAsync: (id: string) => Promise<Doc<T> | undefined>;
    getOrCreateAsync: (id: string) => Promise<Doc<T>>;
    deleteAsync: (id: string) => Promise<void>;
}

export interface ICollectionOptions {
    realtime?: boolean;
}

export class Collection<T> implements ICollection<T> {
    public docs: ObservableMap<string, Doc<T>> = observable(new Map);
    @observable public query?: (ref: firestore.CollectionReference) => firestore.Query;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    private readonly isRealtime: boolean;
    private unsubscribeFirestore?: () => void;
    private readonly queryReactionDisposable: () => void;

    constructor(getFirestoreCollection: () => firebase.firestore.CollectionReference, options: ICollectionOptions = {}) {
        const { realtime = false } = options;

        this.isRealtime = realtime;
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
                            this.docs.set(id, new Doc<T>(this.collectionRef, doc.data() as T, id));
                        }
                        else if (change.type === "removed") {
                            this.docs.delete(id);
                        }
                    });
                })

            });
    }

    public newDoc(data: Partial<T>) {
        return new Doc<Partial<T>>(this.collectionRef, data);
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public updateAsync(id: string, data: T) {
        return updateAsync(this.collectionRef, Object.assign(data, { id }));
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    public addAsync(doc: Doc<T>) {
        // if (!doc.data) throw new Error("Can't save document without data");

        return addAsync<T>(this.collectionRef, doc.data || {}, doc.id);
    }

    public getAsync(id: string) {
        return getAsync<T>(this.collectionRef, id).then(doc => {
            return doc && new Doc<T>(this.collectionRef, doc, id);
        });
    }

    public getOrCreateAsync(id: string) {
        return this.getAsync(id).then(fsDoc => {
            if (fsDoc) return new Promise<Doc<T>>(resolve => resolve(fsDoc));
            else {
                const doc = new Doc<T>(this.collectionRef, null, id);
                return this.addAsync(doc).then(() => doc);
            }
        });
    }

    // TODO: when realtime updates is disabled, we must manually update the docs!
    // WARNING: NEEDS INVESTIGATION: No snapshot change received when deleting a registration
    // Temporary always manually remove the registration from the docs.
    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete().then(() => {
          this.docs.delete(id);  
        }, () => {
            throw new Error("Could not delete document");
        });
    }

    public dispose() {
        if (this.unsubscribeFirestore) this.unsubscribeFirestore();

        this.queryReactionDisposable();
    }
}