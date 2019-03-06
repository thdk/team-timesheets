import { CollectionReference } from '@firebase/firestore-types';

import { observable, computed, action } from "mobx";
import { typeSnapshot } from './FirestoreUtils';

export interface IDocOptions<T, K> {
    deserialize: (firestoreData: K) => T;
    watch?: boolean;
}

export class Doc<T, K = T> {
    @observable
    private dataField: T | {} = {};

    private ref: firebase.firestore.DocumentReference;
    public readonly id: string;
    private hasData = false;
    private deserialize: IDocOptions<T, K>["deserialize"];
    private unwatchDocument?: () => void;

    // TODO: don't allow null as a type for data
    constructor(collectionRef: CollectionReference, data: K | null, options: IDocOptions<T, K>, id?: string) {
        const { deserialize, watch } = options;
        this.deserialize = deserialize;
        this.ref = id ? collectionRef.doc(id) : collectionRef.doc();
        this.id = this.ref.id;
        this.setData(data ? deserialize(data) : null);

        if (watch) this.watch();
    }

    @action
    public setData(data: T | null) {
        this.hasData = !!data;
        this.dataField = data || {};
    }

    @computed
    public get data(): T | undefined {
        return this.hasDataGuard(this.dataField) ? this.dataField : undefined;
    }

    private hasDataGuard(_doc: any): _doc is T {
        return this.hasData;
    }

    public watch() {
        this.unwatchDocument = this.ref.onSnapshot(snapshot => {
            const data = typeSnapshot<K>(snapshot);
            if (data) this.dataField = this.deserialize(data);
        });
    }

    public unwatch() {
        this.unwatchDocument && this.unwatchDocument();
    }
}