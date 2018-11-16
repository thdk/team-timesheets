import * as firebase from "firebase/app";
import "firebase/firestore";
import { typeSnapshot, updateAsync } from "./FirestoreUtils";
import { updateObjectInArray, insertItem } from "./immutable";
import { CollectionMap} from "./app";
import { config } from "./config";
import { observable } from "mobx";

export interface ICollection<T extends IDocument> {
    docs: T[];
    getAsync: () => Promise<T[]>;
    updateAsync: (data: T) => Promise<void>;
    addAsync: (data: T) => Promise<void>;
    new: () => string;
}

export interface IDocument {
    id: string;
}

export class Doc implements IDocument {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export class Collection<T extends IDocument> implements ICollection<T> {
    @observable public docs: T[] = [];
    public readonly name: keyof CollectionMap;
    private readonly collectionRef: firebase.firestore.CollectionReference;

    constructor(name: keyof CollectionMap, firestore: firebase.firestore.Firestore) {
        this.name = name;
        this.collectionRef = firestore.collection(this.name);
    }

    public new() {
        return this.collectionRef.doc().id;
    }

    public getAsync() {
        return this.collectionRef.get()
            .then(
                querySnapshot => this.docs = querySnapshot.docs.map(doc => typeSnapshot<T>(doc))
            );
    }

    public updateAsync(data: T) {
        return updateAsync(this.collectionRef, data).then(() => {
            this.docs = updateObjectInArray(this.docs!, data);
        });
    }

    public addAsync(data: T) {
        return this.collectionRef.add(data).then(() => {
            this.docs = insertItem(this.docs, data);
        });
    }
}

export class Firestorable {
    public readonly firestore: firebase.firestore.Firestore;

    constructor() {
        firebase.initializeApp({
            apiKey: config.apiKey,
            authDomain: 'czech-subs-1520975638509.firebaseapp.com',
            projectId: 'czech-subs-1520975638509'
        });
        this.firestore = firebase.firestore();
        const settings = {/* your settings... */ timestampsInSnapshots: true};
        this.firestore.settings(settings);
    }

    private collections: { [name: string]: ICollection<IDocument> } = {};

    public getAsync<K extends keyof CollectionMap>(path: K): Promise<CollectionMap[K][]> {
        return this.collections[path].getAsync() as Promise<CollectionMap[K][]>;
    }

    public addAsync<K extends keyof CollectionMap>(path: K, data: any) {
        let collection = this.collections[path];
        if (!collection) {
            this.collections["books"] = new Collection(path, this.firestore);
        }
        const id = this.collections[path].new();
        return this.collections[path].addAsync(Object.assign({id}, data));
    }
}