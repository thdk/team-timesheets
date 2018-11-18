
import {firestore} from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, typeSnapshot } from "./FirestoreUtils";
import { insertItem, updateObjectInArray } from "../immutable";
import { CollectionMap } from "../app";
import { observable, action, IObservableArray } from "mobx";
import { OptionalId } from "./types";

export interface ICollection<T extends IDocument> {
    readonly docs: T[];
    getAsync: (query?: (ref: firestore.CollectionReference) => firestore.Query) => Promise<void>;
    updateAsync: (data: T) => Promise<void>;
    addAsync: (data: OptionalId<T>) => Promise<void>;
    deleteAsync: (id: string) => Promise<void>;
}

export interface IDocument {
    readonly id: string;
}

export class Collection<T extends IDocument> implements ICollection<T> {
    @observable public docs: IObservableArray<T> = observable([]);
    private readonly name: keyof CollectionMap;
    private readonly collectionRef: firebase.firestore.CollectionReference;

    constructor(name: keyof CollectionMap, firestore: firebase.firestore.Firestore) {
        this.name = name;
        this.collectionRef = firestore.collection(this.name);
    }

    @action
    public getAsync(query?: (ref: firestore.CollectionReference) => firestore.Query) {
        return (query ? query(this.collectionRef) : this.collectionRef).get()
            .then(
                querySnapshot => {
                    const newDocs = querySnapshot.docs.map(doc => typeSnapshot<T>(doc));
                    this.docs.replace(newDocs);
                });
    }

    @action
    public updateAsync(data: T) {
        return updateAsync(this.collectionRef, data).then(() => {
            this.docs.replace(updateObjectInArray(this.docs!, data));
        });
    }

    @action
    public addAsync(data: OptionalId<T>) {
        return addAsync(this.collectionRef, data).then(addedDoc => {
            const newDocs = insertItem(this.docs, addedDoc, 0);
            this.docs.replace(newDocs);
        });
    }

    @action
    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete().then(() => {
            this.docs.replace(this.docs.filter(d => d.id !== id));
        })
    }
}