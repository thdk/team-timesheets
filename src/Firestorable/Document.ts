import { addAsync } from "./FirestoreUtils";
import { observable } from "mobx";

export class Doc<T> {
    private ref: firebase.firestore.DocumentReference;
    private readonly collectionRef: firebase.firestore.CollectionReference;
    public readonly id: string;
    @observable public data: Partial<T>;
    
    private unwatchDocument?: () => void;

    constructor(collectionRef: firebase.firestore.CollectionReference, data: Partial<T>, id?: string) {
        this.ref = id ? collectionRef.doc(id) : collectionRef.doc();
        this.collectionRef = collectionRef;
        this.id = this.ref.id;
        this.data = data;              
    }

    public watch() {
        this.unwatchDocument = this.ref.onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data) this.data = data as T;
        });  
    }

    public unwatch() {
        this.unwatchDocument && this.unwatchDocument();
    }

    public save() {
        addAsync(this.collectionRef, this.data, this.id);
    }
}