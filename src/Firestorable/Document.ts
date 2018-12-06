import { IDocument } from "./Collection";
import { OptionalId } from "./types";
import { addAsync } from "./FirestoreUtils";
import { observable } from "mobx";

export class Doc<T extends IDocument> {
    private ref: firebase.firestore.DocumentReference;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    @observable public readonly data: T;

    constructor(collectionRef: firebase.firestore.CollectionReference, data: OptionalId<T>) {
        this.ref = data.id ? collectionRef.doc(data.id) : collectionRef.doc();
        this.collectionRef = collectionRef;

        data.id = this.ref.id;
        this.data = data as T;
    }

    public save() {
        addAsync(this.collectionRef, this.data);
    }
}