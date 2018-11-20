
import {firestore} from "firebase";
import 'firebase/firestore';

import { updateAsync, addAsync, typeSnapshot } from "./FirestoreUtils";
import { insertItem, updateObjectInArray } from "../immutable";
import { observable, action, IObservableArray, computed } from "mobx";
import { OptionalId } from "./types";
import { CollectionMap } from "../store";

export interface ICollection<T extends IDocument> {
    readonly docs: T[];
    query?: (ref: firestore.CollectionReference) => firestore.Query;
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
    queryField?: (ref: firestore.CollectionReference) => firestore.Query;
    private readonly name: keyof CollectionMap;
    private readonly collectionRef: firebase.firestore.CollectionReference;

    constructor(name: keyof CollectionMap, firestore: firebase.firestore.Firestore) {
        this.name = name;
        this.collectionRef = firestore.collection(this.name);
    }

    public getAsync() {
        return (this.queryField ? this.queryField(this.collectionRef) : this.collectionRef).get()
            .then(
                querySnapshot => {
                    const newDocs = querySnapshot.docs.map(doc => typeSnapshot<T>(doc));
                    this.docs.replace(newDocs);
                });
    }

    public updateAsync(data: T) {
        return updateAsync(this.collectionRef, data).then(() => {
            this.docs.replace(updateObjectInArray(this.docs!, data));
        });
    }

    public addAsync(data: OptionalId<T>) {
        return addAsync(this.collectionRef, data).then(addedDoc => {            
            this.docs.push(addedDoc);
        });
    }

    public deleteAsync(id: string) {
        return this.collectionRef.doc(id).delete().then(() => {
            this.docs.replace(this.docs.filter(d => d.id !== id));
        })
    }

    public get query() {
        return this.queryField;
    }

    public set query(query: ((ref: firebase.firestore.CollectionReference) => firebase.firestore.Query) | undefined) {
        this.queryField = query;
        this.getAsync();
    }
}