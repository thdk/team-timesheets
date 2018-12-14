import { IRootStore } from "../store";
import { observable } from 'mobx';
import { Collection, ICollection } from "../Firestorable/Collection";

export interface IConfigStore {
    projects: ICollection<IProject>;
}

export interface IProject {
    name: string;
    icon?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;

    readonly projects: ICollection<IProject>;
    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject>("projects", getCollection, { realtime: true }));
    }
}