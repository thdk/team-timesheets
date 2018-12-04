import { IRootStore } from "../store";
import { observable } from "mobx";
import { Collection, ICollection, IDocument } from "../Firestorable/Collection";

export interface IConfigStore {
    projects: ICollection<IProject>;
}

export interface IProject extends IDocument {
    name: string;
    icon?: string;
}

export class ConfigStore implements IConfigStore {
    private readonly rootStore: IRootStore;

    readonly projects: ICollection<IProject>;
    constructor(rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        this.rootStore = rootStore;
        this.projects = observable(new Collection<IProject>("projects", getCollection, { realtime: true }));
    }
}