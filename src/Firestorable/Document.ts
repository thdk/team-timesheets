import { observable, computed, action } from "mobx";

export class Doc<T> {
    private ref: firebase.firestore.DocumentReference;
    public readonly id: string;
    @observable private dataField: T | {} = {};
    private hasData = false;

    // TODO: don't allow null as a type for data
    constructor(collectionRef: firebase.firestore.CollectionReference, data: T | null, id?: string) {
        this.ref = id ? collectionRef.doc(id) : collectionRef.doc();
        this.id = this.ref.id;
        this.setData(data);
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
}