import { observable } from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection, IDocument } from './Firestorable/Collection';
import { RouterStore } from 'mobx-router';
import { IViewStore, ViewStore } from './stores/ViewStore';
import { IRegistration, IRegistrationsStore, RegistrationStore } from './stores/RegistrationStore';
import { IUserStore, UserStore } from './stores/UserStore';
import { IProject, IConfigStore, ConfigStore } from './stores/ConfigStore';

export interface CollectionMap {
    "registrations": IRegistration;
    "tasks": ITask;
    "projects": IProject;
}

export interface ITask extends IDocument {
    name: string;
    color?: string;
    icon?: string;
}

const firestorable = new Firestorable();


export interface IRootStore {
    registrations: ICollection<IRegistration>;
    view: IViewStore;
    router: RouterStore;
    registrationsStore: IRegistrationsStore;
}

class Store implements IRootStore {
    readonly registrations: ICollection<IRegistration>;
    readonly tasks: ICollection<ITask>;
    readonly registrationsStore: IRegistrationsStore;
    readonly view: IViewStore;
    readonly user: IUserStore;
    readonly config: IConfigStore;
    router = new RouterStore();

    protected readonly getCollection: (name: string) => firebase.firestore.CollectionReference;

    constructor(getCollection: (name: string) => firebase.firestore.CollectionReference) {
        this.getCollection = getCollection;

        this.registrations = observable(new Collection<IRegistration>("registrations", getCollection, { realtime: true }));
        this.tasks = observable(new Collection<ITask>("tasks", getCollection, { realtime: true }));

        this.view = new ViewStore(this);
        this.user = new UserStore(this);
        this.config = new ConfigStore(this, getCollection);
        this.registrationsStore = new RegistrationStore(this);
        this.loadData();
    }

    loadData() {
        this.tasks.getDocs();
    }
};

const store = (window as any)["store"] = new Store(name => firestorable.firestore.collection(name));

export default store;

