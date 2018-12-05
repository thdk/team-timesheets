import { observable } from "mobx";
import { IRootStore } from "../store";
import { IDocument } from "../Firestorable/Collection";

export interface IRegistration extends IDocument {
    description: string;
    time: number;
    project: string;
    task: string;
    date: firebase.firestore.Timestamp; // Todo: use Date and add conversion layer
}

export interface IRegistrationsStore {
    registration: Partial<IRegistration>;
    save: () => void;
}

export class RegistrationStore implements IRegistrationsStore {
    private rootStore: IRootStore;

    @observable registration: Partial<IRegistration>;

    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.registration = observable<Partial<IRegistration>>({});
    }

    save() {
        // TODO move to Document class for Firestorable (with dynamic validation)
        this.registration.date &&
        this.registration.description &&
        this.registration.project &&
        this.registration.task &&
        this.registration.time &&
        this.rootStore.registrations.addAsync(this.registration as IRegistration)
    }
}