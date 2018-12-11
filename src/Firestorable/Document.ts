import { addAsync } from "./FirestoreUtils";
import { observable } from "mobx";

export class Doc<T> {
    private ref: firebase.firestore.DocumentReference;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    public readonly id: string;
    @observable public readonly data: Partial<T>;

    constructor(collectionRef: firebase.firestore.CollectionReference, data: Partial<T>, id?: string) {
        this.ref = id ? collectionRef.doc(id) : collectionRef.doc();
        this.collectionRef = collectionRef;

        // WARNING: VERIFY IF ID IS NEEDED ON DATA OR IF IT CAN BE SAVED ON DOC INSTEAD
        this.id = this.ref.id;
        this.data = data;
    }

    public save() {
        addAsync(this.collectionRef, this.data);
    }
}